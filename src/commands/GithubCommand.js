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
        return msg.message.indexOf('!github') === 0;
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
                var template = this.commandHandler.getSetting('commands.!github.templates.404');
                template = tim(template, {arg: msg.arg});
                this.commandHandler.client.say(msg.to, template);
        }
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
        var self = this;
        msg.arg = S(msg.message).chompLeft('!github').collapseWhitespace().s;

        if(msg.arg.indexOf('/') > -1){
            // it is a project
            this.github.get('/repos/' + msg.arg, {}, function(err, status, body){
                if(err){
                    self.__handlerErr(err, msg);
                    return;
                }

                var template = self.commandHandler.getSetting('commands.!github.templates.project');
                template = tim(template, body);

                self.commandHandler.client.say(msg.to, template);
                console.log(body.owner);
            });
        } else {
            // it is a user
            this.github.get('/users/' + msg.arg, {}, function(err, status, body, headers){
                if(err) {
                    self.__handlerErr(err, msg);
                }

                var template = self.commandHandler.getSetting('commands.!github.templates.user');
                template = tim(template,body);

                self.commandHandler.client.say(msg.to, template);
            });
        }
    }
};

module.exports = GithubCommand;