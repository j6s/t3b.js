/**
 * In this file, there is only a little bit of restarting to be found,
 * Main init script is in main.js
 */

// me lazy, me use library for getting external ip
var externalip =    require('externalip');
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

// restart on IP change (check every minute)
var ip = null;
externalip(function(err, ip){
    if(err) throw err;
    console.log(ip);

    setTimeout(function(){
        externalip(function(e,i){
            if(err) throw err;
            if(i !== ip){
                child.restart();
                console.log("IP changed from " + ip + " to " + i);
            } else {
                console.log(i);
            }
            ip = i;
        });
    },(60 * 1000));
});