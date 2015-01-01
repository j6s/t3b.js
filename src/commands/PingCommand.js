/**
 * Posts "pong", if "!ping" is sent
 *
 * @param {CommandHandler} commandHandler
 * @constructor
 */
function PingCommand(commandHandler){
    this.commandHandler = commandHandler;
}

PingCommand.prototype = {
    name: 'PingCommand',

    /**
     * Whether or not a message matches the command.
     * Returns true, if a message matches, false if not.
     * Typically you would check the sent message for a keyword at the beginning (like "!cache")
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     * @return {boolean}
     *
     */
    match: function(msg){
        return msg.message.indexOf('!ping') === 0;
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
        this.commandHandler.client.say(msg.to, 'pong');
    }
};

module.exports = PingCommand;