'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project Configuration
  grunt.initConfig({
    exec: {
      clean: {
        command: 'rm -Rf node_modules'
      }
    },
    concat: {
      options: {
        sourceMap: false,
        sourceMapStyle: 'link' // embed, link, inline
      },
      js: {
        src: [
          'src/core/js/k2.module.js',
          'src/core/js/directives/*.js',
          'src/core/js/services/*.js',
          'src/accessoryBars/**/js/*.js',
          'src/keyboards/**/js/*.js'
        ],
        dest: 'dist/k2.js'
      },
      css: {
        src: [
          'src/core/css/*.css',
          'src/accessoryBars/**/css/*.css',
          'src/keyboards/**/css/*.css'
        ],
        dest: 'dist/k2.css'
      },
    },
    copy: {
      templates: {
        expand: true,
        flatten: true,
        src: [
          'src/**/templates/*.html'
        ],
        dest: 'dist/k2/templates/'
      },
      images: {
        expand: true,
        flatten: true,
        src: [
          'src/**/img/*.*'
        ],
        dest: 'dist/k2/img/'
      },
      fonts: {
        expand: true,
        flatten: true,
        src: [
          'fonts/*'
        ],
        dest: 'dist/k2/fonts/'
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      prod: {
        files: {
          'dist/k2.min.js': ['dist/k2.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/k2.min.css': ['dist/k2.css']
        }
      }
    }
  });
  
  grunt.registerTask('default', ['concat', 'copy', 'uglify', 'cssmin']);
};
