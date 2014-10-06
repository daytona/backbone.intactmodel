/**
 * Intact Model
 * (c) 2014 Carl Törnqvist <calle.tornqvist@gmail.com>
 * MIT Licensed
 * https://github.com/daytona/backbone.intactmodel
 */

(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore', 'backbone'], function (_, Backbone) {
      return factory(_, Backbone);
    });
  } else if (typeof exports === 'object') {
    // Node.
    module.exports = factory(require('underscore'), require('backbone'));
  } else {
    // Browser globals
    factory(root._, root.Backbone);
  }

}(this, function (_, Backbone) {
  'use strict';

  /**
   * IntactModel constructor
   */
  var IntactModel = function (attributes, options) {
    // Cloning these properties only gets us so far.
    // The nestled attributes are still passed by reference so if you were
    // to e.g. change the "type" attribute of a property for an instance,
    // you'd change it for the all models of the same class.
    // This should be looked into.
    this.properties = _.clone(this.properties || {});
    this.derived = _.clone(this.derived || {});

    // Ensure a blank session state
    this.session = {};

    // Run super constructor
    return Backbone.Model.call(this, attributes, options);
  };

  _.extend(IntactModel.prototype, Backbone.Model.prototype, {

    /**
     * Defaults to using the property type validator.
     */
    validate: function (attrs, options) {
      var keys = _.keys(attrs);
      var result = _.bind(testAttributes, this)(attrs);

      if (keys.length !== _.keys(result.attributes).length) {
        return (new Error('One or more attributes are not valid.'));
      }
    },

    /**
     * Compile plain object from "native", session and derived attributes.
     */
    compile: function (options) {
      var self = this;
      var derived = {};

      // Compile derived attributes
      _(this.derived).each(function (fn, key, list) {
        if (!_.isFunction(fn)) return;

        derived[key] = fn.call(self, options);
      });

      // Compile all model attributes
      return _.extend(_.clone(this.attributes), _.clone(this.session), derived);
    },

    /**
     * Get value from either native, session or derived property.
     */
    get: function (attr) {
      var val;
      var groups = [this.attributes, this.session, this.derived];

      for (var i = 0, l = groups.length; i < l; i += 1) {
        if (groups[i].hasOwnProperty(attr)) {
          val = groups[i][attr];
          break;
        }
      }

      return _.isFunction(val) ? val.call(this) : val;
    },

    /**
     * See that a model has all it's properties assigned
     */
    isComplete: function () {
      var attrs = this.attributes;
      var props = _.keys(this.properties);

      return _.every(props, function (prop) {
        return attrs.hasOwnProperty(prop);
      });
    },

    /**
     * Graceful clear
     * Default clear method unset both "native" and session attributes.
     * Passing the option `graceful` unsets only the session attributes.
     */
    clear: function(options) {
      var UNDEFINED;
      var attrs = {};
      var list = _.clone(this.session);

      // Ensure options
      options = options || {};

      // Optionally clear only session attributes
      if (!options.graceful) _.extend(list, this.attributes);

      _(list).each(function (val, key, list) {
        attrs[key] = UNDEFINED;
      });

      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    /**
     * Get hash of model's "native" and session attributes
     * that have changes since the last `set`.
     */
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : _.extend({}, this.attributes, this.session);
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    /**
     * Smart set assumption
     * Set attributes that pass type validation.
     * Attributes that does not pass are ignored.
     * Attributes that are not accounted for in `properties` are set to session.
     */
    set: function (key, val, options) {
      var attrs, attributes, session, handleAttr, unset, silent, changes, changing, prev;

      if (!key) return this;

      // Wrapper for looping through attributes and checking with/assigning to
      // proper model properties
      handleAttr = _.bind(function  (type, val, key, attrs) {
        if (!_.isEqual(this[type][key], val)) changes.push(key);

        if (!_.isEqual(prev[key], val)) {
          this.changed[key] = val;
        } else {
          delete this.changed[key];
        }

        if (unset) {
          delete this[type][key];
        } else {
          this[type][key] = val;
        }
      }, this);

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key)) {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      // Ensure options
      options = options || {};

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Filter out attributes unaccounted for as "session" attributes
      attrs = _.bind(testAttributes, this)(attrs);
      attributes = attrs.attributes;
      session = attrs.session;

      // Extract attributes and options.
      unset = options.unset;
      silent = options.silent;
      changes = [];
      changing = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.extend({}, this.attributes, this.session);
        this.changed = {};
      }
      prev = this._previousAttributes;

      // Check for changes of `id`.
      if (_.has(attributes, this.idAttribute)) this.id = attributes[this.idAttribute];

      // Test both "native" and session attributes
      _(attrs).each(function (attrType, type, list) {
        // Update or delete their respective value
        _(attrType).each(_.partial(handleAttr, type));
      });

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i += 1) {
          this.trigger('change:' + changes[i], this, this.get(changes[i]), options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;

      return this;
    },

    save: function(key, val, options) {
      var attrs, method, xhr;
      var attributes = this.attributes;
      var session = this.session;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key)) {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      attrs = _.bind(testAttributes, this)(attrs);

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs.attributes);
        this.session = _.extend({}, session, attrs.session);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs.attributes || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs.attributes;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs.attributes && options.wait) this.attributes = attributes;

      return xhr;
    }
  });

  // Proxy `toJSON` method to compile
  IntactModel.toJSON = IntactModel.compile;

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    IntactModel.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);

      args.unshift(this.compile());

      return _[method].apply(_, args);
    };
  });

  // Attach Backbone Model's extend method
  IntactModel.extend = Backbone.Model.extend;

  // Add to Backbone
  Backbone.IntactModel = IntactModel;

  // Yanked this part from Henrik Joretegs' Human model:
  // https://github.com/HenrikJoreteg/human-model
  //
  // In backbone, when you add an already instantiated model to a collection
  // the collection checks to see if what you're adding is already a model
  // the problem is, it does this witn an instanceof check. We're wanting to
  // use completely different models so the instanceof will fail even if they
  // are "real" models. So we work around this by overwriting this method from
  // backbone 1.0.0. The only difference is it looks for an initialize method
  // (which both Backbone and HumanModel will always have) to determine whether
  // an instantiated model or a simple object is being passed in.
  Backbone.Collection.prototype._prepareModel = function (attrs, options) {
    if (_.isFunction(attrs.initialize)) {
      if (!attrs.collection) attrs.collection = this;
      return attrs;
    }

    options = options || {};
    options.collection = this;

    var model = new this.model(attrs, options);

    if (!model._validate(attrs, options)) {
      this.trigger('invalid', this, attrs, options);
      return false;
    }
    return model;
  };

  /**
   * Validate attributes and seperate them as attributes/session
   * depending on wether the property is accounted for and of the correct type.
   */
  var testAttributes = function (attrs) {
    var session = {};
    var props = this.properties;
    var idAttr = this.idAttribute;

    attrs = _.clone(attrs);

    _(attrs).each(function (value, key, list) {
      var type, length;
      var prop = props[key];

      // Don't try and handle the id
      if (key === idAttr) return;

      // Don't allow attributes unaccounted for
      if (_.isUndefined(prop)) {
        session[key] = value;

        delete attrs[key];

        return;
      }

      // Capitalize type to match with underscore method
      type = prop.type.replace('integer', 'number');
      type = type.slice(0, 1).toUpperCase() + type.slice(1, type.length);

      // Test type using Underscore utility fn
      if (!_.isUndefined(value) && !_['is' + type](value)) delete attrs[key];
    });

    // Return attributes sparated as attributes/session
    return {
      attributes: attrs,
      session: session
    };
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  // Return class
  return IntactModel;
}));
