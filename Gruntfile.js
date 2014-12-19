/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */
 'use strict';
 module.exports = function(grunt) {
     var settings = require('./settings.json');
     var curl = (function(){
         var curl = {};
         var url = settings.commands["!ter"].files;
         var dir = settings.commands["!ter"].dir;
         for(var filename in url){
             curl[dir + filename] = url[filename].url;
         }
         return curl;
     })();

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
              destination:  'doc',
              template :    "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
              configure :   "jsdoc.conf.json"
          }
      },

      curl: curl
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-curl');


  grunt.registerTask('default', ['less']);
  grunt.registerTask('build', ['curl', 'jsdoc']);
};
