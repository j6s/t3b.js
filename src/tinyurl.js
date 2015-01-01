var Promise = require('es6-promise').Promise;
var request = require('request');

module.exports = function(url){
    return new Promise(function(resolve, reject){
        url = 'http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url);
        request(url, function(err, resp, body){
            if(err || resp.statusCode !== 200){
                reject(err);
                return;
            }
            resolve(body);
        });
    });
};