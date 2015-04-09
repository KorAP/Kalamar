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
 * TODO: Use RequireJS
 *   http://addyosmani.com/writing-modular-js/
 *   http://qnundrum.com/question/393866
 */
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
	src : [
	  'dev/js/lib/dagre/dagre.min.js',
	  'dev/js/src/menu.js',
	  'dev/js/src/match.js',
	  'dev/js/src/hint.js',
	  'dev/js/src/vc.js',
	  'dev/js/src/api.js',
	  'dev/js/src/session.js',
	  'dev/js/src/tutorial.js',
	  'dev/js/src/init.js'
	],
	dest: 'dev/js/build/kalamar.js'
      }
    },
    uglify : {
      build : {
	src: 'dev/js/build/kalamar.js',
	dest: 'public/js/kalamar-<%= pkg.version %>.js'
      }
    },
    imagemin: {
      dynamic: {
	files: [{
	  expand: true,
	  cwd: 'dev/img/',
	  src: ['*.{png,gif,jpg,svg}'],
	  dest: 'public/img/'
	}]
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/kalamar-<%= pkg.version %>.css' : 'dev/scss/kalamar.scss',
          'dev/css/kalamar.css' : 'dev/scss/kalamar.scss'
        }
      }
    },
    jasmine: {
      pivotal: {
	src: [
	  'dev/js/src/menu.js',
	  'dev/js/src/match.js',
	  'dev/js/src/match.js',
	  'dev/js/src/vc.js'
	],
	options: {
	  specs: 'dev/js/spec/*Spec.js'
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
	    src: 'favicon.ico',
	    dest: 'public/',
	    nonull:true,
	    timestamp:true
	  }
	]
      }
    },
    watch: {
      css: {
	files: ['dev/scss/{util,fonts,base,header,searchbar,matchinfo,resultinfo,kwic,menu,hint,pagination,logos,alertify,vc,media,kalamar,tutorial,query,sidebar}.scss'],
	tasks: ['sass'],
	options: {
	  spawn: false
	}
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('css', ['sass']);
  grunt.registerTask(
    'default',
    ['copy', 'concat', 'uglify', 'imagemin', 'sass']
  );
};
