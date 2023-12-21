/**
 * Grunt build file for Kalamar.
 * Create assets (based on files in /dev) running
 *   $ grunt
 * in the current folder.
 *
 * @author Nils Diewald
 */
/*
 * TODO: Use https://www.npmjs.com/package/grunt-contrib-compress
 *   for assets.
 *   http://yui.github.io/yuidoc/
 * TODO: Use https://www.npmjs.com/package/grunt-contrib-yuidoc
 * TODO: Implement a LaTeX generator for a pdf of the dokumentation 
 */

const sass = require('sass');

module.exports = function(grunt) {
  var config;

  // Generate requireJS files for l10n
  var reqTasks = [];
  var uglyFiles = {
    'public/js/korap-plugin-<%= pkg.pluginVersion %>.js': ['dev/js/src/plugin/client.js']
  };
  
  for (var i in {'en' : 0, 'de' : 1}) {

    reqTasks.push({
      options: {

        optimize: "none",
        baseUrl: 'dev/js/src',
        paths : {
	        'lib': '../lib',
          'root' : '../../..'
        },
        wrap: true,
        // dir : 'public/js',
        name: 'lib/almond',
        include : ["app/" + i],
        out: 'public/js/kalamar-<%= pkg.version %>-' + i + '.js'
      }
    });

    uglyFiles['public/js/kalamar-<%= pkg.version %>-' + i + '.js'] = ['public/js/kalamar-<%= pkg.version %>-' + i + '.js'];
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: reqTasks,
    terser: {
      kalamar : {
        files: uglyFiles,
        options : {
          sourceMap: {
            includeSources: true
          }
        }
      }
    },
    imagemin: {
      dynamic: {
	      files: [{
	        expand: true,
	        cwd: 'dev/img/',
	        src: ['*.{png,gif,jpg}'],
	        dest: 'public/img/'
	      }]
      }
    },
    sass: {
      dist: {
        options: {
          implementation: sass,
          style: 'compressed',
          outputStyle: 'compressed',
          sourceMap: true
        },
        files: {
          'public/css/kalamar-<%= pkg.version %>.css' : 'dev/scss/kalamar.scss',
          'public/css/kalamar-plugin-<%= pkg.pluginVersion %>.css' : 'dev/scss/plugin.scss',
          'dev/css/kalamar.css' : 'dev/scss/kalamar.scss',
          'dev/css/kwic.css' : 'dev/scss/main/kwic.scss',
          'dev/css/kalamar-plugin.css' : 'dev/scss/plugin.scss'
        }
      }
    },
    // see https://github.com/gruntjs/grunt-contrib-copy/issues/64
    jasmine: {
      pivotal: {
	      src: [
	        'dev/js/src/menu.js',
	        'dev/js/src/match.js',
	        'dev/js/src/hint.js',
	        'dev/js/src/vc.js'
	      ],
	      options: {
	        specs: 'dev/js/spec/*Spec.js',
	        vendor: ['dev/js/lib/require.js']
	      }
      }
    },

    // see https://github.com/gruntjs/grunt-contrib-copy/issues/64
    // for copying binary files
    copy : {
      options: {
	      process:false
      },
      main: {
	      files:[
            {
            expand: true,
            src: 'kalamar.conf.js',
            dest:'public/js/hintc/',
            filter: 'isFile',
            timestamp: true
          },
          {
            expand: true,
            cwd: 'dev/js/src/',
            src: ['default.js','util.js'],
            dest:'public/js/hintc/',
            filter: 'isFile',
            timestamp: true
          },
          {
            expand: true,
            cwd: 'dev/js/lib/',
            src: 'require.js',
            dest:'public/js/hintc/',
            filter: 'isFile',
            timestamp: true
          },
          {
            expand: true,
            cwd: 'dev/js/src/hint/foundries',
            src: '**',
            dest:'public/js/hintc/hint/foundries',
            timestamp: true
          },
          {
            expand: true,
            cwd: 'dev/js/src/hint/',
            src: 'foundries.js',
            dest:'public/js/hintc/hint',
            filter: 'isFile',
            timestamp: true
          },
	        {
	          expand: true,
	          cwd: 'dev/font/',
	          src: '**',
	          dest: 'public/font/',
	          filter: 'isFile',
	          nonull: true,
	          timestamp: true
	        },
	        {
	          expand: true,
	          cwd: 'dev/img/',
	          src: '*.svg',
	          dest: 'public/img/',
	          filter: 'isFile',
	          nonull:true,
	          timestamp:true
	        },
	        {
	          src: 'dev/img/favicon.ico',
	          dest: 'public/favicon.ico',
	          timestamp:true
	        },
          {
	          src: 'dev/robots.txt',
	          dest: 'public/robots.txt',
	          timestamp: true
	        },
          {
	          src: 'public/css/kalamar-plugin-<%= pkg.pluginVersion %>.css',
	          dest: 'public/css/kalamar-plugin-latest.css',
	          timestamp: true
	        },
          {
	          src: 'public/js/korap-plugin-<%= pkg.pluginVersion %>.js',
	          dest: 'public/js/korap-plugin-latest.js',
	          timestamp: true
	        }
	      ]
      }
    },
    watch: {
      css: {
	      files: ['dev/scss/**/*.scss'],
	      tasks: ['sass'],
	      options: {
	        spawn: false
	      }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-terser');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.registerTask('img', ['imagemin','copy']);
  grunt.registerTask('js', ['requirejs']);
  grunt.registerTask('css', ['sass']);
  grunt.registerTask(
    'default',
    ['requirejs', 'terser', 'imagemin', 'sass', 'copy']
  );
};
