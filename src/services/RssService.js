var RssPoster = require('./lib/RssPoster.js');

/**
 * The RSS Service searches for updates in RSS Feeds.
 *
 * @param {ServiceHandler} serviceHandler
 * @constructor
 */
function RssService(serviceHandler) {
    this.serviceHandler = serviceHandler;
    this.settings = serviceHandler.settings.services.rss;
    this.rssPoster = [];

    for(var i = 0; i < this.settings.feeds.length; i++){
        var s = this.settings;
        s.feed =        this.settings.feeds[i];
        s.register =    false;
        s.channels =    this.serviceHandler.settings.clientSettings.channels;

        this.rssPoster.push(new RssPoster(serviceHandler.client, s));
    }
}

RssService.prototype = {
    /**
     * Executes the action once
     */
    exec: function () {
        this.rssPoster.forEach(function(rss){
            rss.check();
        });
    },

    /**
     * Registers the execution of the service every x minutes.
     * __You should save the id of the interval in order to unregister it later__
     */
    register: function () {
        var self = this;
        this.interval = setInterval(function(){
            self.exec();
        }, this.settings.interval);
    },

    /**
     * Clears the interval set by register
     */
    unregister: function () {
        clearInterval(this.interval);
    }
};

module.exports = RssService;