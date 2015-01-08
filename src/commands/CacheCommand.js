var helpers = require('../helpers.js');
var tim = require('tinytim').tim;

/**
 * Posts a funny picture, if "!cache" is typed in the chat
 * @param commandHandler
 * @constructor
 */
function CacheCommand(commandHandler){
    this.commandHandler = commandHandler;
}

CacheCommand.prototype = {
    /**
     * @type {string}
     */
    name: 'CacheCommand',

    /**
     * Whether or not a message matches the command.
     * Returns true, if a message matches, false if not.
     * Typically you would check the sent message for a keyword at the beginning (like "!cache")
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     * @param {string} msg.type
     *
     * @return {boolean}
     *
     */
    match: function(msg){
        return msg.type === "message" && msg.message.indexOf('!cache') === 0;
    },

    /**
     * Execute the command
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     * @param {string} msg.type
     *
     */
    exec: function(msg){
        var urls = this.commandHandler.getSetting('commands.!cache.urls');
        var url = helpers.getRandomElement(urls);
        var template = this.commandHandler.getSetting('commands.!cache.template');

        msg.message = msg.message.replace('!cache', '');
        var message = tim(template, {
            additional: msg.message,
            url: url
        });

        this.commandHandler.__log(this.name, message);
        this.commandHandler.client.say(msg.to, message);
    }
};

module.exports = CacheCommand;