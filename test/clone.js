/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model;

  QUnit.module('clone', {
    setup: function () {
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
    var model = new Model({
      'foo': 'foo',
      'bar': 'bar'
    });

    var clone = model.clone();

    assert.propEqual(model.attributes, clone.attributes, 'Attributes were cloned');
    assert.ok(_.isUndefined(clone.get('bar')), 'Session was not cloned');
  });
}());
