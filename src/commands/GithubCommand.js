var S = require("string");
var octonode = require("octonode");
var tim = require('tinytim').tim;

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
function GithubCommand(commandHandler){
    this.commandHandler = commandHandler;
    this.github = new octonode.client();
}

GithubCommand.prototype = {

    /**
     * @type {string}
     */
    name: 'GithubCommand',

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
        return msg.type === "message" && msg.message.indexOf('!github') === 0;
    },

    /**
     * Handles the errors given by the github api
     * @param err
     * @param msg
     * @private
     */
    __handlerErr: function(err, msg){
        switch(parseInt(err.statusCode)){
            case 404:
            default:
                this.__sendTemplate(msg.to, 'commands.!github.templates.404', msg);
        }
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
        var self = this;
        msg.arg = S(msg.message).chompLeft('!github').collapseWhitespace().s;

        var prefix;
        var templatepath = 'commands.!github.templates.';

        // switching the api commands depending on how the argument is formatted
        if(msg.arg.indexOf('/') > -1) {
            self.commandHandler.__log(self.name, 'searching for project', msg.arg);
            prefix =        '/repos/';
            templatepath += 'project';
        } else {
            self.commandHandler.__log(self.name, 'searching for user', msg.arg);
            prefix =        '/users/';
            templatepath += 'user';
        }

        this.github.get(prefix + msg.arg, {}, function(err,status,body){
            if(err){
                self.commandHandler.__log(self.name, err);
                self.__handlerErr(err, msg);
                return;
            }

            self.__sendTemplate(msg.to, templatepath, body);
        });
    },

    __sendTemplate: function(to, templatename, args){
        this.commandHandler.__log(this.name, '__sendTemplate',  to, templatename, '(args surpressed)');
        var template = this.commandHandler.getSetting(templatename);
        template = tim(template, args);

        this.commandHandler.__log(this.name, 'sendTemplate', to, template);
        this.commandHandler.client.say(to, template);
    }
};

module.exports = GithubCommand;