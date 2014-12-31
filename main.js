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

// config files
var settings = require('./settings.json');
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
        console.log("logging in");
        client.say('nickserv', tim('IDENTIFY {{nick}} {{password}}', login));
        client.say('nickserv', tim('GHOST {{nick}} {{password}}', login));
    }

    /**
     * Initiantes the commandHandler
     */
    console.log("initiating command handler");
    var commandHandler = new CommandHandler(client, settings);

    client.addListener('message', function (from, to, message) {
        commandHandler.handle({
            from: from,
            to: to,
            message: message
        })
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

