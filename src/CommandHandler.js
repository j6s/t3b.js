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

        if(this.getSetting('commands.require.path')){
            var expr = this.getSetting('commands.require.path');
            if(this.getSetting('commands.require.prependDirname')){
                expr = __dirname + "/" + expr;
            }

            glob(expr, function(err,files){
                if(err) throw err;
                files.forEach(function(file){
                    self.registerCommand(file);
                });
            });
        }
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
     * commandHandler.registerCommand('src/commands/CacheCommand.js')
     *
     * @example
     * var CacheCommand = require('src/commands/CacheCommand.js');
     * commandHandler.registerCommand(CacheCommand);
     *
     * @example
     * var CacheCommand = require('src/commands/CacheCommand.js');
     * var cacheCommand = new CacheCommand(commandHandler);
     * commandHandler.registerCommand(cacheCommand);
     *
     * @example
     * commandHandler.registerCommand(null);
     * // throws "Commands must implement match and exec functions, see src/commands/__stub"
     *
     * @param {object|string|function} clss     The command object or class.
     *                                          If a string is given it requires the string as path and then creates a new object,
     *                                          If function / class is given, it creates a new object,
     *                                          If a object is given it uses that object
     *
     * @throws Exception if object does not implement match and exec functions
     *
     * @returns {void}
     */
    registerCommand: function(clss){
        // require the class, if it is a string
        if(typeof clss === "string"){
            clss = require(clss);
        }
        // create new instance, if it is a function
        if(typeof clss === "function"){
            clss = new clss(this);
        }

        // check, if match and exec are implemented
        if(typeof clss.match !== "function" || typeof clss.exec !== "function"){
            throw "Commands must implement match and exec functions, see src/commands/__stub";
        }

        // finally, add it
        this.commands.push(clss);
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