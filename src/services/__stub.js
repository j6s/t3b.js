/**
 * A service is a reoccurring task
 * The function given in exec is executed every interval _minutes_
 * @param serviceHandler
 * @constructor
 */
function StubService(serviceHandler){
    this.serviceHandler = serviceHandler;
}

StubService.prototype = {
    /**
     * Executes the action once
     */
    exec:       function(){
        // do something
    },

    /**
     * Registers the execution of the service every x minutes.
     * __You should save the id of the interval in order to unregister it later__
     */
    register:   function(){
        // just an example using 15minutes
        this.interval = setInterval(this.exec, 1000 * 60 * 15);
    },

    /**
     * Clears the interval set by register
     */
    unregister: function(){
        clearInterval(this.interval);
    }
};

