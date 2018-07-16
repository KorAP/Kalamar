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

module.exports = function(grunt) {
  var config;
  var includeFile = 'default';
  if (grunt.file.exists('kalamar.conf.js')) {
    includeFile = 'root/kalamar.conf';
  };

  // Generate requireJS files for l10n
  var reqTasks = [];
  var uglyFiles = {};
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
        include : [includeFile, "app/" + i],
        out: 'public/js/kalamar-<%= pkg.version %>-' + i + '.js'
      }
    });

    uglyFiles['public/js/kalamar-<%= pkg.version %>-' + i + '.js'] = ['public/js/kalamar-<%= pkg.version %>-' + i + '.js'];
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: reqTasks,
    uglify: {
      kalamar : {
        files: uglyFiles
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
          style: 'compressed'
        },
        files: {
          'public/css/kalamar-<%= pkg.version %>.css' : 'dev/scss/kalamar.scss',
          'dev/css/kalamar.css' : 'dev/scss/kalamar.scss',
          'dev/css/kwic.css' : 'dev/scss/main/kwic.scss'
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
	          filter: 'isFile',
	          nonull:true,
	          timestamp:true
	        },
	        {
	          expand: true,
	          cwd: 'dev/img/',
	          src: '*.svg',
	          dest: 'public/img/',
	          filter: 'isFile',
	          nonull:true,
	          timestamp:true
	        }
	      ]
      }
    },
    watch: {
      css: {
	      files: ['dev/scss/{util,base,fonts,kalamar,media,no-js}.scss',
		            'dev/scss/footer/footer.scss',
		            'dev/scss/sidebar/sidebar.scss',
		            'dev/scss/header/{header,hint,menu,searchbar,vc,datepicker}.scss',
		            'dev/scss/main/{alertify,intro,koralquery,highlight,kwic,logos,tagger,' +
		            'main,matchinfo,panel,tree,pagination,query,'+
		            'resultinfo,sidebar,tutorial,buttongroup}.scss'
	             ],
	      tasks: ['sass'],
	      options: {
	        spawn: false
	      }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('img', ['imagemin','copy']);
  grunt.registerTask('js', ['requirejs']);
  grunt.registerTask('css', ['sass']);
  grunt.registerTask(
    'default',
    ['requirejs', 'uglify', 'imagemin', 'copy', 'sass']
  );
};
