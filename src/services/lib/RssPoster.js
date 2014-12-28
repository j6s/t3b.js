var tim = require('tinytim').tim;
var helpers = require('../../helpers.js');
var http = require('http');
var FeedParser = require('feedparser');

/**
 *
 * @param client        irc.Client
 * @param {object}      settings
 * @param {string}      settings.template
 * @param {string}      settings.feed
 * @param {number}     [settings.interval]
 * @param {string[]}    settings.channels
 * @param {boolean}    [settings.register = true]
 * @param {boolean}    [settings.debug = false]
 * @constructor
 */
function RssPoster(client, settings){
    this.client = client;
    this.settings = helpers.parseSettings(
         settings,
        {register: true, debug: false, interval: 900000},
        ['template', 'feed', 'channels']);

    this.init();
}

RssPoster.prototype = {
    /**
     * Initial actions
     */
    init: function(){
        this.__log('init', this);

        this.check();
        if(this.settings.register){
            this.registerInterval();
        }
    },

    /**
     * Checks a feed and executes __send if needed
     */
    check: function(){
        this.__log('check');

        var self = this;
        http.get(this.settings.feed, function(res){

            res.pipe(new FeedParser({}))
                .on('readable', function(){

                    var stream = this, item;
                    while (item = stream.read()){
                        if(new Date(item.date).getTime() + self.settings.interval > new Date().getTime()){
                            self.__send(item);
                        }
                    }
                })
        });
    },

    /**
     * Sends a item to the chatrooms
     * @param {object} item
     * @private
     */
    __send: function(item){
        var self = this;
        var message = tim(self.settings.template, item);

        this.__log('__send', message);

        this.settings.channels.forEach(function(channel){
            self.client.say(channel, message);
        });
    },

    /**
     * Registers an interval on this.check
     */
    registerInterval: function(){
        this.__log('registerInterval');

        setInterval(this.check, this.settings.interval);
    },

    /**
     * Logs all the things
     * @private
     */
    __log: function(){
        var args = [];
        for(var a in arguments){
            args.push(arguments[a]);
        }
        args.unshift('RssPoster');

        if(this.settings.debug){
            console.log(args);
        }
    }
};

module.exports = RssPoster;