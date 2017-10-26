/**
 * Created by dancen on 15/05/16.
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
        options: {
            stripBanners: true,
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        main_js:{
            src: 'assets/js/includes/*.js',
            dest: 'assets/js/main.js'
        },
        compile_vendor_js: {
            src: 'assets/js/vendor/*.js',
            dest: 'assets/js/vendor.js'
        },
        raw_css:{
            src: ['assets/css/vendor-styles.css', 'assets/css/raw-style.css'],
            dest: 'assets/css/style.css'
        },
        extra_css:{
            src: ['assets/css/vendor-styles.css', 'assets/css/raw-style.css'],
            dest: 'style.css'
        },
        compile_vendor_css:{
            src: 'assets/css/vendor/*.css',
            dest: 'assets/css/vendor-styles.css'
        }
    },

    clean: {
        main_css: ['style.css', 'assets/css/raw-style.css', 'assets/css/style.css', 'style.min.css'],
        main_all_js: ['assets/js/main.js', 'assets/js/main.min.js']
    },

    sass: {
        main: {
            options: {
                style: 'expanded'
            },

            files: {
                'assets/css/raw-style.css': 'assets/scss/style.scss'
            }
        }
    },


    cssmin: {
        options: {
            shorthandCompacting: false,
            roundingPrecision: -1
        },
        main: {
            files: {
                'style.min.css': 'assets/css/style.css'
            }
        }
    },

    autoprefixer:{
        options: {
            browsers: ['last 2 versions', 'ie 8', 'ie 9', '> 1%']
        },
        dist:{
            files:{
            'assets/css/style.css':'assets/css/style.css'
            }
        }
    },

    uglify: {
        main: {
            files: {
                'assets/js/main.min.js': 'assets/js/main.js'
            }
        },
        vendor: {
            files: {
                'assets/js/vendor.min.js': 'assets/js/vendor.js'
            }
        }
    },

    watch: {
        main: {
            files: ['assets/js/includes/*.js', 'assets/scss/*.scss'],
            tasks: ['main_default'],
            options: {
                spawn: false
            }
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('main_default', [
    'clean:main_all_js',
    'clean:main_css',
    'concat:main_js',
    'sass:main',
    'concat:raw_css',
    'concat:extra_css',
    'autoprefixer',
    'cssmin:main',
    'uglify:main',
    'uglify:vendor'
  ]);
  grunt.registerTask('watch_main', 'watch:main');
  grunt.registerTask('compile_js', 'concat:compile_vendor_js');
  grunt.registerTask('compile_css', 'concat:compile_vendor_css');




};