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

    // Loading all grunt helpers
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-move');


    //registering main Task
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

    //registering watch Task
    grunt.registerTask('watch_main', 'watch:main');


    //registering project Init
    //1) Create tree filesystem
    //2) Move Template files to Assets
    //3) Create all template files
    grunt.registerTask('project_init', [

        console.log("Starting Project init "),
        console.log("------"),
        'mkdir:assets',
        console.log("Moving templates to assets"),
        console.log("------"),
        /* Move Templates to Assets */
        console.log("Generating all template files"),
        console.log("------"),
        'generate_template_files',
        console.log("Generating finished successfully")

    ]);

    //Creating template files
    grunt.registerTask('generate_template_files', [
        console.log("Generating CSS files"),
        'template:css',
        console.log("Generating JS files"),
        'template:js',
        console.log("Generating SCSS files"),
        'template:scss',
        console.log("Generating HTML files"),
        'template:html'
    ]);

    grunt.registerTask('migrate_to_wp', [
        /*TODO dodělat migrate to WP Task*/
    ]);

};