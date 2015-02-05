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
var settings = {};
if(fs.existsSync('./settings.json')){
    settings = require('./settings.json');
}
settings = Helpers.parseSettings(settings, require('./settings.default.json'));

var login;
if (fs.existsSync(settings.loginFile)) {
    login = require(settings.loginFile);
} else {
    login = false;
}

// global logger
global.log = require('custom-logger').config({ level:settings.logLevel })

// SASL support
if (settings.useAuth === true){
    settings.clientSettings = Helpers.parseSettings(settings.clientSettings, login.irc);
}


/**
 * Creates the client and logs the user in
 */
var client = new irc.Client(settings.server, settings.nick, settings.clientSettings);

client.on('error', function(err){
    global.log.error(err);
    process.exit(1);
});

client.connect(0, function () {
    global.log.info("successfully connected");

    client.on('pm', function (from, message) {
        global.log.debug(from + ": " + message);
    });

    if (settings.useNickservAuth === true && typeof login.irc === "object") {
        global.log.debug("logging in");
        client.say('nickserv', tim('IDENTIFY {{nick}} {{password}}', login.irc));
        client.say('nickserv', tim('GHOST {{nick}} {{password}}', login.irc));
    } else if (typeof login.irc !== "object"){
        global.log.error("useNickServAuth is set to true but no irc login information was provided, not logging in");
    }

    /**
     * Initiantes the commandHandler
     */
    global.log.debug("initiating command handler");
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
    global.log.debug("initiating serviceHandler");
    var serviceHandler = new ServiceHandler(client, settings);
});

/**
 * Exit the script, if the client throws an error
 */
client.addListener('error', function (message) {
    global.log.error('error: ', message);
    // process.exit(1);
});
