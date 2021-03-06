var helpers = require('./helpers.js');
var glob = require('glob');

function ServiceHandler(client,settings){
    this.client = client;
    this.settings = helpers.parseSettings(settings, {debug: false, glob: true});
    this.init();
}

ServiceHandler.prototype = {
    services: [],

    init: function(){
        this.__log('init');
        var self = this;

        if(this.settings.services.require.path){
            var expr = this.settings.services.require.path;
            if(this.settings.services.require.prependDirname){
                expr = __dirname + "/" + expr;
            }

            glob(expr, function(err,files){
                if(err) throw err;
                files.forEach(function(file){
                    self.registerService(file);
                });
            });
        }

        if(this.settings.services.autoReRegister){
            setInterval(function(){
                self.reRegister();
            }, this.settings.services.autoReRegister)
        }
    },

    registerService: function(clss){
        global.log.info("ServiceHandler.registerService", clss);

        // require the class, if it is a string
        if(typeof clss === "string"){
            clss = require(clss);
        }
        // create new instance, if it is a function
        if(typeof clss === "function"){
            clss = new clss(this);
        }

        helpers.implementsFunctions(clss, ["exec", "register", "unregister"]);
        clss.register();

        // finally, add it
        this.services.push(clss);
    },

    reRegister: function(){
        global.log.debug("ServiceHandler.reRegister");

        this.services.forEach(function(service){
            service.unregister();
            service.register();
        });
    },

    /**
     * Logs all the things
     */
    __log: function(){
        var args = [];
        for(var a in arguments){
            args.push(arguments[a]);
        }
        args.unshift('ServiceHandler');

        if(this.settings.debug){
            global.log.debug.apply(global.log, args);
        }
    }
};

module.exports = ServiceHandler;
