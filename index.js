
/**
 * Module dependencies.
 */

var debug = require('debug')('duo-consolidate');
var thunk = require('thunkify');

/**
 * Plugin cache.
 */

var cache = {};

/**
 * Export `consolidatePlugin`.
 */

exports = module.exports = consolidatePlugin;

/**
 * Expose the plugin map.
 */

exports.map = {
  yaml: 'duo-yaml',
  yml: 'duo-yaml',
  toml: 'duo-toml',
  jade: 'duo-jade',
  styl: 'duo-stylus',
  hbs: 'duo-handlebars',
  less: 'duo-less',
  hogan: 'duo-hogan',
  hg: 'duo-hogan',
  mustache: 'duo-hogan',
  ms: 'duo-hogan',
};

/**
 * Clear the cache.
 *
 * @api private
 */

exports.clearCache = function(){
  cache = {};
};

/**
 * Transform consolidation plugin.
 *
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

function consolidatePlugin(opts){
  opts = opts || {};
  return function* consolidate(file, entry){
    if (!exports.map[file.type]) {
      return debug('no tranform for "%s"', file.id);
    }

    var plugin = lazy(file.type)(opts);
    debug('running plugin "%s" on "%s"', plugin.name, file.id);

    // generator
    if (generator(plugin)) yield plugin(file, entry);
    // async plugin
    else if (async(plugin)) yield thunk(plugin)(file, entry);
    // sync plugin
    else plugin(file, entry);
  };
}

/**
 * Lazy-require `type` plugin.
 */

function lazy(type){
  var mod = exports.map[type];
  cache[type] = cache[type] || require(mod);
  return cache[type];
}

/**
 * Check if `fn` is async (based on arity).
 */

function async(fn){
  return 3 == fn.length;
}

/**
 * Check if `fn` is a generator function.
 */

function generator(fn){
  return fn
      && fn.constructor
      && 'GeneratorFunction' == fn.constructor.name;
}
