/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model, attrs;

  QUnit.module('Compile', {
    setup: function () {
      attrs = {
        'foo': 'foo',
        'bar': 'bar'
      };

      Model = Backbone.IntactModel.extend({
        properties: {
          foo: {
            type: 'string'
          }
        }
      });
    }
  });

  QUnit.test('All properties', function(assert) {
    var model = new Model(attrs);

    assert.propEqual(model.compile(), attrs, 'All attributes match');
  });

  QUnit.test('With derived', function(assert) {
    var result = _.extend({
      'together': 'foo bar'
    }, attrs);

    var DerivedModel = Model.extend({
      derived: {
        'together': function () {
          return this.get('foo') + ' ' + this.get('bar');
        }
      }
    });

    var model = new DerivedModel(attrs);

    assert.propEqual(model.compile(), result, 'All attributes match');
  });
}());
