/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model;

  QUnit.module('Get and set', {
    setup: function () {
      Model = Backbone.IntactModel.extend({
        properties: {
          foo: {
            type: 'string'
          }
        },
        derived: {
          baz: function (options) {
            return (this.has('foo') && this.has('bar')) ? (this.get('foo') + ' ' + this.get('bar')) : null;
          }
        }
      });
    }
  });

  QUnit.test('Attributes', function (assert) {
    var model = new Model({
      'foo': 'foo'
    });

    assert.strictEqual(model.attributes.foo, 'foo', 'Attribute was assigned');
  });

  QUnit.test('Session', function (assert) {
    var model = new Model({
      'bar': 'bar'
    });

    assert.strictEqual(model.session.bar, 'bar', 'Attribute was assigned');
  });

  QUnit.test('Has', function(assert) {
    var model = new Model();

    assert.ok(!model.has('foo'), '"Has" not unassigned property');
    assert.ok(!model.has('bar'), '"Has" not unassigned session attribute');
    assert.ok(model.has('baz'), '"Has" declared derived attribute');

    model.set({
      'foo': 'foo',
      'bar': 'bar'
    });

    assert.ok(model.has('foo'), '"Has" assigned attribute');
    assert.ok(model.has('bar'), '"Has" assigned session attribute');
  });
}());
