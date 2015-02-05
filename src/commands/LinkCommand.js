var Helpers = require('../Helpers.js');
/**
 * Created by NIMIUS on 05.02.15.
 */
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
function LinkCommand(commandHandler){
    this.commandHandler = commandHandler;
    this.client = commandHandler.client;
    this.settings = commandHandler.getSetting("commands.shit");
    this.options = this.settings.links;
    global.log.debug(this.options);
}

LinkCommand.prototype = {
    /**
     * Name of the command, used for logging
     * @type {string}
     */
    name: 'LinkCommand',

    is: function(msg, what){
        what = what || "";

        if(what === "msg"){
            return msg.type === "message";
        }

        global.log.debug(what, msg.message, msg.message.indexOf(what) === 0, this.is(msg, "msg"));

        if(typeof this.options[what] !== "undefined"){
            return msg.message.indexOf(what) === 0 && this.is(msg, "msg");
        }

        // if nothing given, return if anything is something;
        for(var cmd in this.options){
            if(this.is(msg,cmd)) return true;
        }
        return false;
    },

    /**
     * Whether or not a message matches the command.
     * Returns true, if a message matches, false if not.
     * Typically you would check the sent message for a keyword at the beginning (like "!cache")
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     * @param {string} msg.type     The type of the message ("message", "invite", "kick", ...)
     *
     * @return {boolean}
     *
     */
    match: function(msg){
        return this.is(msg);
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
        for(var cmd in this.options){
            global.log.debug("-",cmd,this.is(msg, cmd));
            if(this.is(msg, cmd)){
                global.log.debug(cmd, this.options[cmd]);
                var link = Helpers.getRandomElement(this.options[cmd]);
                this.client.say(msg.to,link);
            }
        }
    }
};

module.exports = LinkCommand;