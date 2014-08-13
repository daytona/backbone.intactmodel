/*global QUnit, _, Backbone */
(function () {
  'use strict';

  var Model, attrs;

  QUnit.module('validate', {
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

  QUnit.test('Undeclared property', function(assert) {
    var model = new Model();

    assert.ok(model.validate(attrs) instanceof Error, 'Returns an error when trying to set properties unaccounted for');
  });

  QUnit.test('Wrong type', function(assert) {
    var model = new Model({foo: []});

    assert.ok(model.validate(attrs) instanceof Error, 'Returns an error when trying to set properties of the wrong type');
  });

  QUnit.test('Declared property', function(assert) {
    var model = new Model();

    assert.ok(_.isUndefined(model.validate({foo: 'foo'})), 'Returns nothing when everything is fine');
  });
}());
