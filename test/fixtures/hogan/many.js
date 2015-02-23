module.exports = function(obj){
  return [
    require('./template.mustache').render(obj),
    require('./template.hogan').render(obj),
    require('./template.hg').render(obj),
    require('./template.ms').render(obj),
  ].join('\n');
}
