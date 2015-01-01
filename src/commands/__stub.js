/**
 * Because JavaScript does not support Interfaces and TypeScript is a little hard to set up correctly with
 * Node, let's do it this way: Please do define commands as single modules in here and export a object like the one below
 *
 * The class itself must be exported.
 * The File containing the class must be name *Command.js
 *
 * @param {CommandHandler} commandHandler
 * @constructor
 */
function StubCommand(commandHandler){
    this.commandHandler = commandHandler;
}

StubCommand.prototype = {
    /**
     * Name of the command, used for logging
     * @type {string}
     */
    name: '',

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
    match: function(msg){},

    /**
     * Execute the command
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     */
    exec: function(msg){

    }
};

module.exports = StubCommand;