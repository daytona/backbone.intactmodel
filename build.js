var fs = require('fs');
var _ = require('underscore');
var uglify = require('uglify-js');
var spec = require('./package.json');
var bower = require('./bower.json');

var bower = _.extend(bower, {
  name: spec.name,
  version: spec.version,
  description: spec.description,
  main: spec.main,
  dependencies: spec.dependencies
});

// build our bower package
fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2));

// build minified file
fs.writeFileSync('backbone.intactmodel.min.js', uglify.minify('backbone.intactmodel.js').code);
