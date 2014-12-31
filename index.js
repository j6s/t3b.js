/**
 * In this file, there is only a little bit of restarting to be found,
 * Main init script is in main.js
 */

var forever =       require('forever-monitor');
var settings =      require('./settings.json');

/**
 * Create new forever monitor instance
 */
var child = new(forever.Monitor)('main.js', {
    max: 100
});
child.start();

["start", "stop", "restart"].forEach(function(e){
    console.log(e);
    child.on(e, function(){console.log(e)});
});

// restart every once in a while
setTimeout(function(){
    child.restart();
}, settings.restart);
