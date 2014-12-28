/**
 * THis is the main Script of the bot.
 * It is restarted every 12 hours (unless specified differently in settings.json -> restart)
 */

var settings =          require('./settings.json');
var irc =               require('irc');
var CommandHandler =    require('./src/CommandHandler.js');
var process =           require('process');

/**
 * Creates client and commandHandler objects and register all the important tasks
 */
var client = new irc.Client(settings.server, settings.nick, {
    channels: settings.channels
});
var commandHandler = new CommandHandler(client,settings);

client.addListener('message', function(from, to, message){
    commandHandler.handle({
        from: from,
        to: to,
        message: message
    })
});

/**
 * Exit the script, if the client throws an error
 */
 client.addListener('error', function(message) {
     console.log('error: ', message);
     process.exit(1);
});