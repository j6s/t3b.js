var settings =          require('./settings.json');
var irc =               require('irc');
var CommandHandler =    require('./src/CommandHandler.js');

var client = new irc.Client(settings.server, settings.nick, {
    channels: settings.channels
});
var commandHandler = new CommandHandler(client,settings);

commandHandler.registerHandler(function(msg){
    console.log(msg);
});

client.addListener('message', function(from, to, message){
    commandHandler.handle({
        from: from,
        to: to,
        message: message
    })
});