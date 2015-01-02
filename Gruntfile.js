/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */
'use strict';
module.exports = function (grunt) {
    var settings =  require('./settings.json');
    var pack =      require('./package.json');
    grunt.initConfig({
        pkg: {
            name: 'NIM'
        },

        jsdoc: {
            src: [
                'index.js',
                'src/*.js'
            ],
            options: {
                destination: 'doc',
                template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                configure: "jsdoc.conf.json"
            }
        },
        availabletasks: { tasks: {} }
    });

    // load every grunt task in the devDependencies
    // we don't do this by hand because we are lazy
    for(var d in pack.devDependencies){
        if(d.indexOf("grunt-") === 0){
            grunt.loadNpmTasks(d);
        }
    }

    grunt.registerTask('default',   'Executed, if grunt is called without a task',          ['availabletasks']);
    grunt.registerTask('build',     'Builds documentation and prepares the project for use',['jsdoc']);
};
