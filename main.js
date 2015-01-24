/**
 * THis is the main Script of the bot.
 * It is restarted every 12 hours (unless specified differently in settings.json -> restart)
 */
// external modules
var irc = require('irc');
var tim = require('tinytim').tim;

// system modules
var fs = require('fs');

// own modules
var CommandHandler = require('./src/CommandHandler.js');
var ServiceHandler = require('./src/ServiceHandler.js');
var Helpers =        require('./src/helpers.js');

// config files
var settings =       require('./settings.json');
settings = Helpers.parseSettings(settings, require('./settings.default.json'));

console.log(settings);
process.exit(0);

var login;
if (fs.existsSync(settings.loginFile)) {
    login = require(settings.loginFile);
} else {
    login = false;
}


/**
 * Creates the client and logs the user in
 */
var client = new irc.Client(settings.server, settings.nick, settings.clientSettings);

client.on('error', function(err){
    console.error(err);
    process.exit(1);
});

client.connect(0, function () {
    console.log("successfully connected");

    client.on('pm', function (from, message) {
        console.log(from + ": " + message);
    });

    if (login) {
        // TODO enable / disable nickserv auth
        console.log("logging in");
        client.say('nickserv', tim('IDENTIFY {{nick}} {{password}}', login.irc));
        client.say('nickserv', tim('GHOST {{nick}} {{password}}', login.irc));
    }

    /**
     * Initiantes the commandHandler
     */
    console.log("initiating command handler");
    var commandHandler = new CommandHandler(client, settings);

    // this is kind of hacky, i know
    // but it creates a new scope, so the event variable
    // is not lost due to time offset (because we are handling events here)
    Object.keys(settings.clientSettings.listenEvents).forEach(function(event){
        client.addListener(event, function(){
	    var argNames = settings.clientSettings.listenEvents[event];
	    var msg = {type: event};
	    for(var i = 0; i < argNames.length; i++){
		msg[argNames[i]] = arguments[i]
	    }
	    commandHandler.handle(msg);
	});
    });


    /**
     * Initiates the serviceHandler
     */
        console.log("initiating serviceHandler");
    var serviceHandler = new ServiceHandler(client, settings);
});

/**
 * Exit the script, if the client throws an error
 */
client.addListener('error', function (message) {
    console.log('error: ', message);
    process.exit(1);
});

