/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model;

  QUnit.module('derived', {
    setup: function () {
      Model = Backbone.IntactModel.extend({
        properties: {
          first: {
            type: 'string'
          },
          second: {
            type: 'string'
          }
        },
        derived: {
          phrase: function () {
            return this.get('first') + ' ' + this.get('second') + (this.get('end') || '.');
          }
        }
      });
    }
  });

  QUnit.test('Access attributes', function(assert) {
    var model = new Model({
      'first': 'Hello',
      'second': 'world'
    });

    assert.strictEqual(model.get('phrase'), 'Hello world.', 'Derived property can access attributes');
  });

  QUnit.test('Access session', function(assert) {
    var model = new Model({
      'first': 'Hello',
      'second': 'world',
      'end': '!'
    });

    assert.strictEqual(model.get('phrase'), 'Hello world!', 'Derived property can access session');
  });
}());
