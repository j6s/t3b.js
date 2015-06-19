var S = require('string');
var tim = require('tinytim').tim;
var fs = require('fs');

/**
 * Karma Tracking for the bot:
 * Use `++ username` or `-- username` to add or substract karma
 * Use `!karma username` to get information about the karma of the person
 * Use `!karma` to get the top five ranked persons
 *
 * You can also add up to 5 karma points at once by using
 * `++5 username`
 *
 * @param {CommandHandler} commandHandler
 * @constructor
 */
function KarmaCommand(commandHandler){
    this.commandHandler = commandHandler;

    // load karma from the persisted file
    var path = __dirname + '/../../' + commandHandler.getSetting('commands.!karma.file');
    if(fs.existsSync(path)){
        // the filesystem function are relative to the main file
        // but require is relative to this file,
        // that's why have to add ../../
        this.karma = require(path);
    } else {
        this.karma = {};
    }
}

KarmaCommand.prototype = {
    karma: {},
    /**
     * Name of the command, used for logging
     * @type {string}
     */
    name: 'KarmaCommand',

    /**
     * Just a small abstraction for all the checks
     * @param what
     * @param msg
     * @returns {bool}
     * @private
     */
    __is: function(what, msg){
        switch(what){
            case 'message':
                // checks if the type is message
                return msg.type === "message";
            case 'plus':
                // checks against `++username`
                return this.__is('message', msg) && msg.message.indexOf('++') === 0;
            case 'minus':
                // checks agains `--username`
                return this.__is('message', msg) && msg.message.indexOf('--') === 0;
            case 'karma':
                // checks against `!karma`
                return this.__is('message', msg) && msg.message.indexOf('!karma') === 0;
            case 'something':
                // checks if one of the above matches
                return this.__is('plus', msg) || this.__is('minus', msg) || this.__is('karma', msg);
            default:
                throw what + ' not found';
        }
    },

    /**
     * Accepted KarmaCommands:
     * - `++username`
     * - `--username`
     * - `!karma username`
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
        return this.__is('something', msg);
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
        var username = S(msg.message)
                        .chompLeft('++')
                        .chompLeft('--')
                        .chompLeft('!karma')
                        .collapseWhitespace().s;


        if(this.__is('plus', msg) || this.__is('minus', msg)){
            global.log.debug("CommandHandler.KarmaCommand.exec", "adding karma");
            var delta = 1;

            // we have the ability to add up to 5 karma at a time
            if(msg.message.search('(\\+|\\-){2}[1-5]') === 0){
                // the delta the is the 3rd character
                delta = parseInt(msg.message.substr(2,1));

                // of course we have to change the username
                // please note, that the stringjs chompLeft __needs__ a string as input
                username = S(username).chompLeft("" + delta).collapseWhitespace().s;
            }

            if(username == msg.from){
              global.log.info(username + " tried to push himself");
                this.commandHandler.client.say(msg.to, tim(this.commandHandler.getSetting('commands.!karma.templateSelfPush'), {username: username}))

                if(this.karma[username] > 0){
                    this.karma[username] = 0;
                }
                this.__persists();

                return;
            }

            // if it is minus, everything is negative
            if(this.__is('minus', msg)){
                delta *= -1;
            }

            this.__addKarma(username, delta);
            this.commandHandler.client.say(msg.to, this.__getMessage(username));
            this.__persists();

        } else if (this.__is('karma', msg)) {
            // show karma stats
            if (username === '') {
                // no username given, print top 5
                var topFive = this.__getTopFive();
                global.log.debug("CommandHandler.KarmaCommand.exec", "topFive");

                for(var i = 0; i < topFive.length; i++){
                    this.commandHandler.client.say(msg.to, this.__getMessage(topFive[i]));
                }

            } else {
                // username given
                console.log(username);
                this.commandHandler.client.say(msg.to, this.__getMessage(username));
            }
        }
    },

    /**
     * Returns an 2 dimensional Array consisting of usernames and karma
     *
     * @TODO have caching
     * @returns {Array}
     * [[4,"j6s"], [2, "thephpjo"]]
     * @private
     */
    __getSortableArray: function(){
        // {"username": -3, "username2": 2}
        var sortable = [];
        for(var user in this.karma){
            sortable.push([this.karma[user], user]);
        }

        sortable.sort(function(a,b){
            return b[0] - a[0];
        });

        return sortable;
    },

    /**
     * gets the rank of a user
     * @param username
     * @private
     * @TODO iterating over the whole karma 3 times? this is madness
     */
    __getRank: function(username){
        var sortable = this.__getSortableArray();

        for(var i = 0; i < sortable.length; i++){
            if(sortable[i][1] == username){
                return i;
            }
        }
        return -1;
    },

    /**
     * Returns an array of the top five ranked users
     *
     * @returns {string[]}
     * @private
     */
    __getTopFive: function(){
        var sortable = this.__getSortableArray();

        var retval = [];
        for(var i = 0; i < sortable.length; i++){
            retval.push(sortable[i][1]);
            if(i === 5) break;
        }

        return retval;
    },


    /**
     * get the message response for the chat
     * @param username
     * @returns {*}
     * @private
     */
    __getMessage: function(username){
        // this way we go shure, that this.karma[username] actually exists
        this.__addKarma(username, 0);

        var template = this.commandHandler.getSetting('commands.!karma.template');
        template = tim(template, {
            rank: this.__getRank(username),
            username: username,
            karma: this.karma[username]
        });

        return template;
    },

    /**
     * @param username
     * @param delta
     * @private
     */
    __addKarma: function(username, delta){
        this.karma[username] = this.karma[username] || 0;
        this.karma[username] += parseInt(delta);
        this.commandHandler.__log(this.name, this.karma);
    },

    /**
     * Persists the whole karma object
     * @returns {void}
     * @private
     */
    __persists: function(){
        fs.writeFile(__dirname + "/../../" + this.commandHandler.getSetting("commands.!karma.file"), JSON.stringify(this.karma), function(err){
            if(err){
                throw err;
            }

            console.log("done");
        });
    }
};

module.exports = KarmaCommand;
