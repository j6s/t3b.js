var S = require('string');
var helpers = require('./helpers');
var Promise = require('es6-promise').Promise;

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
     * Constructor for the CommandHandler class,
     * calls all of the init commands
     * @returns {void}
     */
    init: function(){
        for(var cmd in this.initcmds){
            this.initcmds[cmd].apply(this);
        }
    },

    /**
     * All the commands live in this object.
     *
     * The keys are the strings used to invoke the command, the function is called with an object msg containing
     * the following keys: from, to, message
     *
     * the commands are invoked with apply, so 'this' reffers to the CommandHandler object
     *
     * @type        {object}
     * @property    {function} !cache
     * @property    {function} !ping
     * @property    {function} !ter
     */
    commands: {
        /**
         * Posts a random picture to the room about clearing the cache
         * @param msg
         */
        "!cache": function(msg){
            var urls = this.settings.commands["!cache"].urls;
            this.client.say(msg.to, helpers.getRandomElement(urls));
        },

        /**
         * sends the message 'pong' back, to test if the bot is still running
         * @param msg
         */
        "!ping": function(msg){
            this.client.say(msg.to, 'pong');
        },

        /**
         * Searches for a extension in the TER.
         * Make shure you downloaded the json files with grunt
         *
         * @param msg
         */
        /*"!ter": function(msg){
            var settings = this.settings.commands["!ter"];
            var data = settings.data;
            var ext = S(msg.message).chompLeft('!ter').collapseWhitespace().s;
            var keysToScan = [];

            settings.extkeyCombos.forEach(function(combo){
                keysToScan.push(S(combo).template({key: ext}).s);
            });


            for(var filename in data){
                for(var i = 0; i < keysToScan.length; i++){
                    if(typeof data[filename][keysToScan[i]] !== "undefined"){
                        var versions = Object.keys(data[filename][keysToScan[i]]);
                        var latest = data[filename][keysToScan[i]][versions[versions.length-1]]; // this is madness
                        latest.key = ext;
                        latest.url = S(settings.link).template(latest).s;
                        latest.authorString = "";

                        latest.authors.forEach(function(author){
                            latest.authorString += S("{{name}} ~{{username}} <{{email}}>,").template(author).s;
                        });

                        var message = S(settings.message).template(latest).s;

                        this.client.say(msg.to, message);

                        console.log(latest);
                    }
                }
            }
        }*/
    },

    /**
     * Commands ran on startup. If a command has to set something up, here is the time to do it
     * @type        {object}
     * @property    {function}  !ter    Sets up the !ter command: loads the right json paths
     */
    initcmds: {
        /*"!ter": function(){
            var self = this;
            var json = Object.keys(this.settings.commands["!ter"].files);
            var dir = this.settings.commands["!ter"].dir;
            this.settings.commands["!ter"].data = {};

            json.forEach(function(filename){
                var data = require('../' + dir + filename);
                data = helpers.getPath(data,self.settings.commands["!ter"].files[filename].path);
                self.settings.commands["!ter"].data[filename] = data;
            })
        }*/
    },

    /**
     * Just some Handlers called on messages
     * @type {Array}
     */
    handlers: [],

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
        var cmds = Object.keys(this.commands);

        for(var i = 0; i < cmds.length; i++){
            if(msg.message.indexOf(cmds[i]) === 0){
                this.commands[cmds[i]].apply(this, [msg]);
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
    }
};

module.exports = CommandHandler;