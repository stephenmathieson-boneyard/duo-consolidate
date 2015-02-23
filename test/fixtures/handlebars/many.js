var hello = require('./template.hbs');
var goodbye = require('./template2.hbs');

module.exports = function(who){
  return hello(who) + goodbye(who);
}
