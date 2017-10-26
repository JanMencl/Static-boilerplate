/**
 * Created by dancen on 15/05/16.
 */
module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        mkdir: {
            assets: {
                options: {
                    create: [
                        'assets',
                        'assets/css',
                        'assets/js',
                        'assets/fonts',
                        'assets/img',
                        'assets/scss',
                        'assets/templates',
                        'assets/css/vendor',
                        'assets/js/includes',
                        'assets/js/modules',
                        'assets/js/vendor'
                    ]
                }
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            main_js:{
                src: ['assets/js/vendor/*.js', 'assets/js/includes/*.js'],
                dest: 'assets/js/main.js'
            },
            main_css:{
                src: ['assets/css/vendor/*', 'assets/css/style.css'],
                dest: 'assets/css/style.css'
            }
        },
        sass: {
            main: {
                options: {
                    style: 'expanded'
                },

                files: {
                    'assets/css/style.css': 'assets/scss/style.scss'
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
            }
        },
        clean: {
            main_css: ['style.css', 'assets/css/raw-style.css', 'assets/css/style.css', 'style.min.css'],
            main_all_js: ['assets/js/main.js', 'assets/js/main.min.js']
        },
        watch: {
            main: {
                options: {
                    spawn: false
                },
                files: ['assets/js/includes/*.js', 'assets/scss/*.scss'],
                tasks: ['main_default']
            }
        },
        template: {
            scss_template: {
                options: {
                    data: {
                        title: 'My blog post',
                        author: 'Mathias Bynens',
                        content: 'Lorem ipsum dolor sit amet.'
                    }
                },
                files: {
                    'post.html': ['assets/templates/post.html.tpl']
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
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-template');

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

    grunt.registerTask('project_init', [
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

    grunt.registerTask('generate_template_files', [
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

    grunt.registerTask('migrate_to_wp', [
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

};