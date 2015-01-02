var request =   require('request');
var S =         require('string');
var tinyurl =   require('../tinyurl.js');

/**
 * Posts a tinyURL Link to lmgtfy (let me google that for you)
 *
 * @param {CommandHandler} commandHandler
 * @constructor
 * @example
 * <person> !lmgtfy test
 * <t3b>    tinyurl.com/abcdefg     // redirects to lmgtfy.com?q=test
 */
function LmgtfyCommand(commandHandler){
    this.commandHandler = commandHandler;
}

LmgtfyCommand.prototype = {
    /**
     * @type {string}
     */
    name: 'LmgtfyCommand',

    CMD: '!lmgtfy',

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
        return msg.type === "message" && msg.message.indexOf(this.CMD) === 0;
    },

    /**
     * Execute the command
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     */
    exec: function(msg){
        var arg  = 'http://lmgtfy.com?q=' + S(msg.message).chompLeft(this.CMD).collapseWhitespace().s;
        var self = this;

        tinyurl(arg).then(function(url){
            self.commandHandler.__log(self.name, url);
            self.commandHandler.client.say(msg.to, url);
        }, function(err){
            self.commandHandler.__log(self.name, JSON.stringify(err));
        });
    }
};

module.exports = LmgtfyCommand;