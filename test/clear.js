/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model;

  QUnit.module('clear', {
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

    model.clear();

    assert.ok(_.isUndefined(model.get('foo')), 'Attributes were cleared');
    assert.ok(_.isUndefined(model.get('bar')), 'Session was cleared');
  });

  QUnit.test('Graceful', function(assert) {
    var model = new Model({
      'foo': 'foo',
      'bar': 'bar'
    });

    model.clear({graceful: true});

    assert.strictEqual(model.get('foo'), 'foo', 'Attributes were spared');
    assert.ok(_.isUndefined(model.get('bar')), 'Session was cleared');
  });
}());
