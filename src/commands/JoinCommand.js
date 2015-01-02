/**
 * Joins a channel if invited to do so. Note, that this will not be persistent.
 * If the bot should join other channels after startup, check out the clientSettings.channels setting in settings.json
 *
 * @param {CommandHandler} commandHandler
 * @constructor
 */
function JoinCommand(commandHandler){
    this.commandHandler = commandHandler;
}

JoinCommand.prototype = {
    /**
     * Name of the command, used for logging
     * @type {string}
     */
    name: 'JoinCommand',

    /**
     * Responds to every invite.
     *
     * @param {object} msg
     * @param {string} msg.channel      The receiver of the message / the room the message was sent in
     * @param {string} msg.from         The sender of the invite
     * @param {string} msg.type
     *
     * @return {boolean}
     *
     */
    match: function(msg){
        return msg.type === "invite";
    },

    /**
     * Join the channel
     *
     * @param {object} msg
     * @param {string} msg.channel      The receiver of the message / the room the message was sent in
     * @param {string} msg.from         The sender of the invite
     * @param {string} msg.type
     */
    exec: function(msg){
        this.commandHandler.__log(this.name, "join", msg.channel);
        this.commandHandler.client.join(msg.channel);
    }
};

module.exports = JoinCommand;