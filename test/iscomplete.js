/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model, attrs;

  QUnit.module('isComplete', {
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

  QUnit.test('Complete ', function(assert) {
    var model = new Model({
      'bar': 'baz'
    });

    assert.ok(!model.isComplete(), 'Not complete when only has session');

    model.set({
      'foo': 'bar'
    });

    assert.ok(model.isComplete(), 'Complete when property is assigned');
  });
}());
