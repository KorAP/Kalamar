/*
 * http://gruntjs.com/getting-started
 *
 * Todo: Move all source files outside the public folder!
 *
 * TODO: Use https://www.npmjs.com/package/grunt-contrib-compress
 * for assets.
 * http://yui.github.io/yuidoc/
 * use it with https://www.npmjs.com/package/grunt-contrib-yuidoc
 *
 * RequireJS
 * http://addyosmani.com/writing-modular-js/
 * http://qnundrum.com/question/393866
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
	  'dev/js/src/util.js'
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
          'public/css/kalamar-<%= pkg.version %>.css' : 'dev/scss/kalamar.scss'
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
    watch: {
/*
      options: {
	livereload: true
      },
      scripts: {
        files: ['js/*.js'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false
        },
      },
*/
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
  grunt.registerTask('css', ['sass']);
  grunt.registerTask('default', ['concat', 'uglify', 'imagemin', 'sass']);
};
