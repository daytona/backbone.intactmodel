# IntactModel

IntactModel is in most part inspired by Henrik Joreteg's [HumanModel](https://github.com/HenrikJoreteg/human-model) and would not have been made was it not for the pressing need for legacy support (I'm looking at you, IE8). IntactModel aims to help you keep your models intact by forcing strictly typed properties set to the model and at the same time allow for session attributes such as states or arbitrary data without persisting them to the server.
Properties declaration aim to follow the [JSON Schema](http://json-schema.org/) for testing types. *In no way* is this a complete implementation of the JSON schema, only `type` is implemented at this time.

## Properties
The aim is to support JSON schema but not at the price of excessive code bloat, hence, as of now IntactModel only tests against the `type` property. More properties could very well be added on later.

```javascript
var Model = new Backbone.IntactModel({
  properties: {
    'foo': {type: 'string'}
  }
});

var model = new Model({
  'foo': []
});

model.attributes; // {}
```

## Session attributes
IntactModel aims to be graceful in how it handles your attributes. If you try to set an attribute that is not declared on beforehand IntactModel simply sets it as a session attribute and allows you to `get` is just as if it were a "native" attribute. You never have to bother with separating "native" attributes from session attributes, IntactModel does that for you.

```javascript
var Model = new Backbone.IntactModel({
  properties: {
    'foo': {type: 'string'}
  }
});

var model = new Model({
  'foo': 'foo',
  'bar': 'bar'
});

JSON.stringify(model);  // {"foo": "foo", "bar": "bar"}
model.attributes;       // {"foo": "foo"}
model.session;          // {"bar": "bar"}
model.save();           // Payload: {"foo": "foo"}
```

## Derived attributes
IntactModel supports derived attributes that can compute and compile a value based on the model's other properties. This is best explained with an example:

```javascript
var Model = new Backbone.IntactModel({
  properties: {
    'first': {type: 'string'},
    'second': {type: 'string'}
  },
  derived: {
    'greeting': function () {
      return this.get('first') + ' ' + this.get('last');
    }
  }
});

var model = new Model({
  'first': 'Hello',
  'second': 'world!'
});

model.get('greeting'); // "Hello world!"
```

## Notes on model methods

### extend
A common pattern is to extend upon common model classes. To be able to extend on the model's `properties` and `derived` attributes without overwriting them, a custom deep extend is the default extend method for IntactModel. In short, `IntactModel.extend` performs a regular `Backbone.Model.extend` and also manually extends on it's super's `properties`, `derived` and `defaults`.

If this behaviour is not what you want, simply call the default `Backbone.Model`'s extend method, as so:

```javascript
var MyModel = Backbone.Model.extend.call(SomeOtherModel, {
  properties: {
    'someAttribute': {type: 'string'}
  }
});
```

### isComplete
A utility function for checking whether a model has all it's declared properties as defined attributes. Useful for determining if the model ought to be fetched to ensure complete data.

### compile
The `compile` method is a way of getting all the model's data. Compile returns the the model's `attributes`, `session` and `derived` properties, all merged in to one object, in that order (meaning colliding attribute names we be overridden).

### toJSON
The toJSON method is unaltered, meaning it only returns a clone of the model attributes.

### validate
IntactModel has the function it uses for testing properties assigned as it's default `validate` method. Override this if you have other needs regarding validation.

### clone
The clone method is unaltered, meaning it only clones model.attributes.

### clear
Clearing a model behaves in essence in the same way as a default Backbone Model. Calling clear on a model simply unsets all its "native" and session attributes. However, passing in the option `graceful` unsets only the session attributes, leaving the `model.attributes` untouched.

```javascript
var Model = new Backbone.IntactModel({
  properties: {
    'foo': {type: 'string'}
  }
});

var model = new Model({
  'foo': 'foo',
  'bar': 'bar'
});

// Gracefully clear the model
model.clear({graceful: true});

model.attributes; // {"foo": "foo"}
model.session;    // {}

// Completely clear the model
model.clear();

model.attributes; // {}
```

## License
[MIT](http://opensource.org/licenses/MIT)
