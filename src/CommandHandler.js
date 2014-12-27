var S = require('string');
var helpers = require('./helpers');
var Promise = require('es6-promise').Promise;
var glob = require('glob');

/**
 * Handles incomming commands
 *
 * @example
 * var client = new irc.Client(...);
 * var commandHandler = new commandHandler(client, settings);
 *
 * @param {irc.Client}  client      The irc client object
 * @param {object}      settings    The settings from settings.json
 * @constructor
 */
function CommandHandler(client, settings){
    this.client = client;
    this.settings = settings;
    this.init();
}

CommandHandler.prototype = {

    /**
     * Just some Handlers called on messages
     * @type {Array}
     */
    handlers: [],

    /**
     * Our Command objects live here
     */
    commands: [],

    /**
     * Constructor for the CommandHandler class,
     * @returns {void}
     */
    init: function(){
        var self = this;

        glob(__dirname + '/commands/*Command.js', function(err, files){
            if(err) throw err;

            files.forEach(function(file){
                var Class = require(file);
                self.commands.push(new Class(self));
            });
        });
    },


    /**
     * handles the commands in a message.
     *
     * Commands are handled by looking if the command is __at the beginning__ of the message
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     *
     * @returns {boolean}
     * @private
     */
    __handleCommands: function(msg){
        var self = this;

        for(var i = 0; i < this.commands.length; i++){
            var command = this.commands[i];
            if(command.match(msg)){
                command.exec(msg);
                return true;
            }
        }

        return false;
    },

    /**
     * Calls registered Handlers
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     *
     * @returns {void}
     * @private
     */
    __callHandlers: function(msg){
        var self = this;
        this.handlers.forEach(function(handler){
            handler.apply(self, [msg]);
        })
    },

    /**
     * Handles a incoming message
     *
     * @example
     * irc.addListener('message', function(from, to, message){
     *      commandHandler.handle({
     *          from: from,
     *          to: to,
     *          message: message
     *      });
     * })
     *
     * @param {object} msg
     * @param {string} msg.to       The receiver of the message / the room the message was sent in
     * @param {string} msg.from     The sender of the message
     * @param {string} msg.message  The message itself
     *
     * @returns {void}
     */
    handle: function(msg){
        this.__handleCommands(msg);
        this.__callHandlers(msg);
    },

    /**
     * Registers a "third Party" command
     *
     * @example
     * // just echo back the message
     * commandHandler.registerCommand('!echo', function(msg){
     *      this.client.say(msg.to, msg.message);
     * });
     *
     * @param {string}   name   name of the command
     * @param {function} func   function executed for the command.
     *                          The function receives a message object containing the key from, to and message
     *                          The function is invoked with 'apply', so 'this' reffers to the commandHandler instance
     * @returns {void}
     */
    registerCommand: function(name, func){
        if(typeof func !== "function"){
            throw "argument func must be of type function";
        }
        if(typeof this.commands[name] !== "undefined"){
            throw "command " + name + " was already registered";
        }

        this.commands[name] = func;
    },

    /**
     * Register a handler that is executed on every message
     *
     * @param func
     */
    registerHandler: function(func){
        if(typeof func !== "function"){
            throw "argument func must be of type function";
        }

        this.handlers.push(func);
    },

    /**
     *
     * @param {Array,string} path
     */
    getSetting: function(path){
        if(typeof path === "string"){
            path = path.split('.');
        }

        return helpers.getPath(this.settings,path);
    }
};

module.exports = CommandHandler;