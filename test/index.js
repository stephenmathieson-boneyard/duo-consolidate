
var vm = require('vm');
var assert = require('better-assert');
var path = require('path');
var fixture = path.join.bind(path, __dirname, 'fixtures');
var thunk = require('thunkify');
var rimraf = thunk(require('rimraf'));
var Duo = require('duo');
var plugin = require('..');

describe('duo-consolidate', function(){
  beforeEach(plugin.clearCache);

  describe('jade', function(){
    beforeEach(cleanup.bind(null, 'jade'));
    it('should transform .jade files', function*(){
      var js = yield duo('jade').run();
      var tpl = evaluate(js).main;
      var str = tpl({ who: 'world' });
      assert('<h1>hi world!</h1>' == str);
    });

    it('should only include the runtime once', function*(){
      var js = yield duo('jade', 'many.js').run();
      var tpl = evaluate(js).main;
      var str = tpl({ who: 'world' });
      assert('<h1>hi world!</h1><h2>goodbye world!</h2>' == str);
      var marker = 'exports\\.rethrow = function rethrow\\(';
      var expr = new RegExp(marker, 'g');
      assert(1 == js.match(expr).length);
    });
  });

  describe('handlebars', function(){
    beforeEach(cleanup.bind(null, 'handlebars'));
    it('should transform .handlebars files', function*(){
      var js = yield duo('handlebars').run();
      var tpl = evaluate(js).main;
      var str = tpl({ who: 'world' });
      assert('<h1>hi world!</h1>' == str.trim());
    });

    it('should only include the runtime once', function*(){
      var js = yield duo('handlebars', 'many.js').run();
      var tpl = evaluate(js).main;
      var str = tpl({ who: 'world' });
      assert('<h1>hi world!</h1>\n<h2>goodbye world!</h2>' == str.trim());
    });
  });

  describe('stylus', function(){
    beforeEach(cleanup.bind(null, 'stylus'));
    it('should transform .styl files', function*(){
      var css = yield duo('stylus', 'index.styl').run();
      assert('body {\n  background-color: #f00;\n}' == css.trim());
    });
  });

  describe('less', function(){
    beforeEach(cleanup.bind(null, 'less'));
    it('should transform .less files', function*(){
      var css = yield duo('less', 'index.less').run();
      assert('body .foo {\n  color: red;\n}' == css.trim());
    });
  });

  describe('hogan', function(){
    beforeEach(cleanup.bind(null, 'hogan'));
    it('should transform .mustache files', function*(){
      var js = yield duo('hogan').run();
      var tpl = evaluate(js).main;
      var str = tpl.render({ who: 'world' });
      assert('hi world!' == str);
    });

    it('should only include the runtime once', function*(){
      var js = yield duo('hogan', 'many.js').run();
      var fn = evaluate(js).main;
      var str = fn({ who: 'world' });
      assert('hi world!\nhi world!\nhi world!\nhi world!' == str);
      var marker = 'typeof exports !== \'undefined\' \\? exports : Hogan\\)';
      var expr = new RegExp(marker, 'g');
      assert(1 == js.match(expr).length);
    });
  });

  describe('yaml', function(){
    beforeEach(cleanup.bind(null, 'yaml'));
    it('should support .yml and .yaml', function*(){
      var js = yield duo('yaml').run();
      var exports = evaluate(js).main;
      assert('bar' == exports.foobar.foo);
      assert('bang' == exports.foobar.fiz[1]);
      assert('Detroit Tigers' == exports.teams.american[1]);
      assert('Atlanta Braves' == exports.teams.national[2]);
    });
  });

  describe('toml', function(){
    beforeEach(cleanup.bind(null, 'toml'));
    it('should support toml', function*(){
      var js = yield duo('toml').run();
      var exports = evaluate(js).main;
      assert('TOML Example' == exports.title);
      assert('1979-05-27T07:32:00.000Z' == exports.owner.dob);
    });
  });

  describe('using multiple transforms', function(){
    it('should work', function*(){
      var js = yield duo('multiple-transforms').run();
      var html = evaluate(js).main;
      assert('<h1>Hello World!</h1>' == html);
    });
  });
});

/**
 * Get a `Duo` instance.
 */

function duo(root, entry){
  return Duo(fixture(root))
    .entry(entry || 'index.js')
    .use(plugin());
}

/**
 * Evaluate.
 */

function evaluate(js){
  var ctx = {};
  vm.runInNewContext('main =' + js + '(1)', ctx, 'main.vm');
  return ctx;
}

/**
 * Clean `root`.
 */

function* cleanup(root){
  var build = fixture(root, 'build');
  yield rimraf(build);
  var components = fixture(root, 'components');
  yield rimraf(components);
}
