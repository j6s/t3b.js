var request = require('request');
var Promise = require('es6-promise').Promise;

/**
 * @namespace Helpers
 */
function Helpers() {
}

/**
 * Parses a settings object, adds default values, if they are not set and checks
 * if required values are set
 *
 * @example var settings = Helpers.parseSettings({
 *                              name: "John Doe",
 *                          }, {
 *                              // defaults
 *                              city: "New York"
 *                          });
 *                          // returns {name: "John Doe", city: "New York"}
 *
 * @example var settings = Helpers.parseSettings({
 *                              name: "John Doe",
 *                          }, {
 *                              //  no defaults
 *                          }, [
 *                              // required
 *                              "city"
 *                          ]);
 *                          // throws an error, because city is not set
 *
 * @example var settings = Helpers.parseSettings({
 *                              name: "John Doe",
 *                          }, {
 *                              // defaults
 *                              city: "New York"
 *                          }, [
 *                              // required
 *                              ["city"]
 *                          ]);
 *                          // returns {name: "John Doe", city: "New York"}
 *                          // does not throw an error
 *
 *
 * @param {object}  settings            The settings object
 * @param {object} [defaults = {}]      The object of defaults settings (will be included into settings, if that one is empty)
 * @param {array}  [required = Array]   The required attributes, will throw an error if those are not there.
 *                                      Note: defaults are proccessed before required settings are. If a setting has a default
 *                                      and is required, it will not throw an error, because it uses the default value (see example 3)
 *
 * @returns {object}    The proccessed settings
 */
Helpers.parseSettings = function parseSettings(settings, defaults, required) {
    console.log(settings);
    required = required || [];
    defaults = defaults || {};

    for(var s in defaults){
        settings[s] = settings[s] || defaults[s];
    }

    for(var i = 0; i < required.length; i++){
        if(typeof settings[required[i]] === "undefined"){
            throw "settings." + required[i] + " must be set";
        }
    }

    return settings;
};

/**
 * Cast an array or object of values to a certain type and return it in the same structure again
 *
 * Currently supported types:
 * - int / integer
 * - float
 * - string
 *
 * Throws an exception if unknown type is passed
 *
 * @example Helpers.recursiveCast("int", [
 *              1,
 *              2.00,
 *             "3"
 *          ]);
 *          // => returns [1,2,3]
 *
 * @example Helpers.recursiveCast("float", {
 *              i:     "1",
 *              like:   2.00,
 *              cookies: {
 *                  very:  "2",
 *                  much:   false
 *              }
 *          }
 *          // => returns {
 *          //              i:      1.00,
 *          //              like:   2.00,
 *          //              cookies: {
 *          //                  very:   2.00,
 *          //                  much:   0.00
 *          //              }
 *          //            }
 *
 * @example Helpers.recursiveCast("bogus", [1,2,3]);
 *          // => throws "type bogus is not defined"
 *
 * @param {string}                      type    The type to cast to
 * @param {object|string|number|Array}  values  The value array
 * @returns {object|string|number|Array}
 */
Helpers.recursiveCast = function recursiveCast(type, values){
    var ret;
    if(values instanceof Array){
        ret = [];
        for (var i = 0; i < values.length; i++){
            ret.push(Helpers.recursiveCast(type, values[i]));
        }
        return ret;
    }

    if(typeof values === "object"){
        ret= {};
        for(var i in values){
            ret[i] = Helpers.recursiveCast(type, values[i]);
        }
        return ret;
    }


    switch(type){
        case "integer":
        case "int":
            return parseInt(values);
        case "float":
            return parseFloat(values);
        case "string":
            return "" + values;
        default:
            throw "type " + type + "is not defined";
    }

};

/**
 * Looks if there are shared elements in two arrays. If there are shared elements, it returns true, if not false
 *
 * @example Helpers.arraysIntersect([1,2,3],[4,2,5]) // returns true, because [1,2,3] contains 2
 * @example Helpers.arraysIntersect([1,2,3],[4,5,6]) // returns false, because no intersection
 *
 * @param {Array} arr1  The first array
 * @param {Array} arr2  The second array
 *
 * @returns {boolean}
 */
Helpers.arraysIntersect = function arraysIntersect (arr1, arr2){
    arr1 = (arr1 instanceof Array) ? arr1 : [arr1];
    arr2 = (arr2 instanceof Array) ? arr2 : [arr2];


    for(var i = 0; i < arr2.length; i++){
        if(arr1.indexOf(arr2[i]) > -1){
            return true;
        }
    }

    return false;
};

/**
 * Proccesses an array of booleans, returns true if every element is true, returns false, if one or more is false
 * (logical And on every element)
 *
 * Returns false, if empty array is passed
 * Throws an error, if arr is not an array
 *
 * @example Helpers.multiAnd([true, true, true]);
 *          // => returns true
 *
 * @example Helpers.multiAnd([true, true, false]);
 *          // returns false
 *
 * @example Helpers.multiAnd("bogus");
 *          // throws "argument must be array"
 *
 * @param {boolean[]}   arr Array of booleans
 * @returns {boolean}
 */
Helpers.multiAnd = function multiAnd(arr){
    if(!(arr instanceof Array)){
        throw "argument must be array";
    }

    switch(arr.length){
        case 0:
            return false;
        case 1:
            return arr[0];
        default:
            for(var i = 0; i < arr.length; i++){
                if(arr[i] === false){
                    return false;
                }
            }
            return true;
    }
};

/**
 * gets the JSON of a url and returns a promise that is resolved, when the json is ready and
 * rejected if there was an error
 *
 * @example
 * Helpers.getJSON('http://test.com/awesome.json').then(function(jsondata){
 *      doSomething(jsondata);
 * })
 *
 * @param {string} url
 * @returns {Promise}
 */
Helpers.getJSON = function getJSON(url){
    return new Promise(function(resolve, reject){
        request({
            url: url,
            json: true
        }, function(err, resp, body){
            if(err){
                reject(err);
            }
            resolve(body);

        });
    })
};

/**
 *
 * @param {object} object
 * @param {string[]} path
 */
Helpers.getPath = function getPath(object, path){
    path.forEach(function(p){
        object = object[p];
    });
    return object;
};

/**
 * Returns a random element of an array
 * @param {Array} arr
 * @returns {*}
 */
Helpers.getRandomElement = function getRandomElement(arr){
    var num = Math.round(Math.random() * (arr.length - 1));
    return arr[num];
};


module.exports = Helpers;