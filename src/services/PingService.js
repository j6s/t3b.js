/**
 * This service just sends a PING command to the server every x minutes to be shure that the connection is still
 * runnning. If the connection is down, the bot will shut down and be restarted by forever
 *
 * @see https://github.com/martynsmith/node-irc/issues/76
 * @param serviceHandler
 * @constructor
 */
function PingService(serviceHandler){
    this.serviceHandler = serviceHandler;
    this.client = serviceHandler.client;
    this.settings = serviceHandler.settings;
}

PingService.prototype = {

    /**
     * Callbacks / Evenet listeners to add, see register and unregister
     */
    callbacks: {
        ping: function(server){
            console.log("ping", server);
        },
        pong: function(server){
            console.log("pong", server);
        }
    },


    /**
     * Executes the action once
     */
    exec: function(){
        var self = this;
        // getting information about myself to have my current server
        this.client.whois(this.settings.nick,function(info){
            self.client.send("PING", info.server)
        });
    },

    /**
     * Registers the execution of the service every x minutes.
     * __You should save the id of the interval in order to unregister it later__
     */
    register:   function(){
        for(var c in this.callbacks){
            this.client.addListener(c, this.callbacks[c]);
        }

        // just an example using 15minutes
        this.interval = setInterval(this.exec, this.settings.services.ping.interval);

        // ping once on register
        this.exec();
    },

    /**
     * Clears the interval set by register
     */
    unregister: function(){
        for(var c in this.callbacks){
            this.client.removeListener(c, this.callbacks[c]);
        }
        clearInterval(this.interval);
    }
};

module.exports = PingService;