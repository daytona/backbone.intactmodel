/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model, attrs;

  QUnit.module('Collection', {
    setup: function () {
      Model = Backbone.IntactModel.extend({
        properties: {
          foo: {
            type: 'string'
          }
        }
      });

      attrs = {
        'foo': 'foo',
        'bar': 'bar'
      };
    }
  });

  QUnit.test('Add', function (assert) {
    var model = new Model(attrs);

    var collection = new Backbone.Collection();

    collection.add(model);
    collection.add(attrs);

    assert.propEqual(collection.at(0).compile(), collection.at(1).attributes, 'Added model and added attributes are added correctly');
  });

  QUnit.test('As model attribute', function (assert) {
    var model = new Model(attrs);

    var Collection = Backbone.Collection.extend({
      model: Backbone.IntactModel
    });

    var collection = new Collection([model, attrs]);

    assert.ok(collection.at(0) instanceof Backbone.IntactModel, 'Pre-defined IntactModel is an instance of it\'s prototype');
    assert.ok(collection.at(1) instanceof Backbone.IntactModel, 'Added attributes creates an instance of IntactModel');
  });
}());
