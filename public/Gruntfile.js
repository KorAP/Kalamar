/**
 */
/*
 * http://gruntjs.com/getting-started
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
	  'js/lib/dagre/dagre.min.js',
	  'js/src/menu.js',
	  'js/src/matchInfo.js',
	  'js/src/hint.js',
	  'js/src/vc.js'
	],
	dest: 'js/build/kalamar.js'
      }
    },
    uglify : {
      build : {
	src: 'js/build/kalamar.js',
	dest: 'js/build/kalamar.min.js'
      }
    },
    imagemin: {
      dynamic: {
	files: [{
	  expand: true,
	  cwd: 'img/',
	  src: ['**/*.{png,gif,jpg,svg}'],
	  dest: 'img/build/'
	}]
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'css/build/kalamar.css': 'scss/kalamar.scss'
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
	files: ['scss/{colors,base,matchinfo,menu,pagination,kalamar}.scss'],
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
  grunt.registerTask('css', ['sass']);
  grunt.registerTask('default', ['concat', 'uglify', 'imagemin', 'sass']);
};
