var hello = require('./template.jade');
var goodbye = require('./template2.jade');

module.exports = function(who){
  return hello(who) + goodbye(who);
}
