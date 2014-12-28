/**
 * THis is the main Script of the bot.
 * It is restarted every 12 hours (unless specified differently in settings.json -> restart)
 */
// external modules
var irc =               require('irc');
var tim =               require('tinytim').tim;

// system modules
var fs =                require('fs');

// own modules
var CommandHandler =    require('./src/CommandHandler.js');
var RssPoster =         require('./src/RssPoster.js');

// config files
var settings =          require('./settings.json');
var login;
if(fs.existsSync(settings.loginFile)){
    login = require(settings.loginFile);
} else {
    login = false;
}

/**
 * Creates client and commandHandler objects and register all the important tasks
 */
var client = new irc.Client(settings.server, settings.nick, settings.clientSettings);

client.connect(0, function(){
client.on('pm', function(from, message){
    console.log(from + ": " + message);
});

if(login){
    client.say('nickserv', tim('IDENTIFY {{nick}} {{password}}', login));
    client.say('nickserv', tim('GHOST {{nick}} {{password}}', login));
}

var commandHandler = new CommandHandler(client,settings);
var rssFeeds = [];


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


    settings.rss.feeds.forEach(function (feed) {
        var s = settings.rss;
        s.feed = feed;
        s.channels = settings.clientSettings.channels;
        s.debug = true;

        rssFeeds.push(new RssPoster(client, s));
    });

});

