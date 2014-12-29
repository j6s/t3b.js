/**
 * In this file, there is only a little bit of restarting to be found,
 * Main init script is in main.js
 */

var CronJob =       require('cron').CronJob;
var forever =       require('forever-monitor');
var settings =      require('./settings.json');

/**
 * Create new forever monitor instance
 */
var child = new(forever.Monitor)('main.js');
child.start();

child.on('start', function(){
    console.log("starting");
});

child.on("restart", function(){
    console.log("restarting");
});

setTimeout(function(){
    child.start(true);
}, settings.restart);