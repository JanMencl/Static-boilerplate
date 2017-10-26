const gulp         = require('gulp');
const fs           = require('fs-extra');
const pth          = require('path');
const yaml         = require('read-yaml');
const sass         = require('gulp-sass');
const sourcemaps   = require('gulp-sourcemaps');
const cleanCSS     = require('gulp-clean-css');
const clean        = require('gulp-clean');
const uglifyJS     = require('uglify-js');
const rev          = require('gulp-rev');
const gulpif       = require('gulp-if');
const inlineResize = require('gulp-inline-resize');
const imagemin     = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const util         = require('gulp-util');

function isProduction() {
    return process.argv.indexOf('--production') !== -1;
}

var patternsDir = 'bower_components';
if (fs.existsSync('patterns')) {
    patternsDir = 'patterns';
}
if (util.env['patterns-dir']) {
    patternsDir = util.env['patterns-dir'];
}

gulp.task('default', ['build'], function () {
    // Do build
});

gulp.task('build', ['revisions'], function () {
    // Do dependencies
});

gulp.task('styles', ['images-optimize'], function () {
    // Clean after compilation
    //return gulp.src(['public/assets/**/*.scss'])
    //  .pipe(clean());
});

gulp.task('admin', ['admin-images', 'admin-assets'], function () {
    return gulp.src([
        'vendor/inspishop/admin/Assets/build/css/*.css',
        'vendor/inspishop/admin/Assets/build/js/*.js'
    ])
        .pipe(gulpif('*.css', gulp.dest('public/assets/styles')))
        .pipe(gulpif('*.js', gulp.dest('public/assets/scripts')));
});

gulp.task('admin-images', ['clean'], function () {
    return gulp.src(['vendor/inspishop/admin/Assets/img/**/*']).pipe(gulp.dest('public/img/admin'));
});

gulp.task('admin-assets', ['clean'], function () {
    // TODO: refactor
    gulp.src('bower_components/fontawesome/fonts/**').pipe(gulp.dest('public/assets/fonts'));
    gulp.src('bower_components/flag-icon-css/flags/**/**').pipe(gulp.dest('public/img/flags'));
    gulp.src('bower_components/tinymce/**').pipe(gulp.dest('public/tinymce'));
    gulp.src('vendor/inspishop/core/Assets/js/tinymce/**').pipe(gulp.dest('public/tinymce/plugins'));
});

gulp.task('revisions', ['styles'], function () {
    return gulp.src([
        'public/assets/styles/*.css',
        'public/assets/scripts/*.js'
    ], {base: 'public/assets'})
        .pipe(rev())
        .pipe(gulp.dest('public/assets'))
        .pipe(rev.manifest('rev-manifest.json'))
        .pipe(gulp.dest('public/assets'));
});

gulp.task('styles-compile', ['assets'], function () {
    return gulp.src('public/assets/**/*.scss')
        .pipe(gulpif(!isProduction(), sourcemaps.init()))
        .pipe(sass({outputStyle: 'compressed', includePaths: patternsDir}).on('error', sass.logError))
        //.pipe(autoprefixer({cascade: false}))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(gulpif(!isProduction(), sourcemaps.write('./maps')))
        .pipe(gulp.dest('public/assets'));
});

gulp.task('images-move', ['fonts-move'], function () {
    return gulp.src([
        'resources/assets/img/**/*.+(svg)'
    ])
        .pipe(gulp.dest('public/assets/img'));
});
gulp.task('fonts-move', ['styles-compile'], function () {
    return gulp.src([
        'resources/assets/fonts/**/*'
    ])
        .pipe(gulp.dest('public/assets/fonts'));
});

gulp.task('images-optimize', ['images-cache'], function () {
    return gulp.src(['public/cache-images/img/**/*'])
        .pipe(gulpif(isProduction(), imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true,
            verbose: true
        })))
        .pipe(gulp.dest('public/assets/img'));
});

gulp.task('images-cache', ['images-move'], function () {
    return gulp.src([
        "public/assets/**/*.+(css)",
        "resources/assets/**/*.+(jpg|png|gif)",
        "resources/assets/**/resize.css"
    ])
        .pipe(inlineResize({
            replaceIn: ['.css'],
            quiet: false,
            naiveCache: {destFolder: 'public/cache-images'}
        }))
        .pipe(gulpif('*.css', gulp.dest('public/assets')))
        .pipe(gulp.dest('public/cache-images'));
});

gulp.task('watch', ['build'], function () {
    gulp.watch([patternsDir + '/**/*'], ['build']);
    gulp.watch(['resources/instances/**/*'], ['build']);
    gulp.watch(['resources/assets/**/*'], ['build']);
});

gulp.task('clean', function () {
    return gulp.src([
        'public/assets',
        'public/img'
    ], {read: false})
        .pipe(clean());
});

gulp.task('assets', ['admin'], function () {
    var filesScss      = [];
    var filesScssExtra = [];
    var filesJs        = [];

    // Patterns
    var listPatters = fs.readdirSync(patternsDir).filter(function (file) {
        if (file.indexOf('patterns-') === 0) {
            return true;
        }
    });

    listPatters.forEach(function (name) {
        var path = patternsDir + '/' + name;

        // Read assets metadata
        try {
            var assetsMetadata = fs.readFileSync(path + '/assets.json', 'utf8');
            assetsMetadata     = JSON.parse(assetsMetadata);

            Object.keys(assetsMetadata.copy).forEach(function (key) {
                fs.copySync(key, 'public/assets/' + assetsMetadata.copy[key]);
            });

            // Add styles
            if (assetsMetadata.styles) {
                assetsMetadata.styles.forEach(function (p) {
                    filesScss.push('public/assets/' + p);
                });
            }

            // Add extra styles
            if (assetsMetadata.styles) {
                assetsMetadata['styles-extra'].forEach(function (p) {
                    filesScssExtra.push('public/assets/' + p);
                });
            }

            // Add scripts
            if (assetsMetadata.scripts) {
                assetsMetadata.scripts.forEach(function (p) {
                    filesJs.push('public/assets/' + p);
                });
            }
        }
        catch (e) {
            if (e.code == 'ENOENT') {
                // Do nothing, there is no assets meta file
            }
            else {
                console.log('Problem with asset.json file in ' + name + '.');
                console.log(e);
            }
        }

        processDirectory(path, function (p) {
            processScss(p);
            processJs(p);
        });
    });

    // Instances
    processDirectory('resources/instances/scss', processScss);
    processDirectory('resources/instances/js', processJs); // We do not need this

    // Resources Assets
    processDirectory('resources/assets/scss', processScss);
    processDirectory('resources/assets/js', processJs);

    // Write files
    filesScss.sort(sortByFilename);
    filesScssExtra.sort(sortByFilename);
    filesJs.sort(sortByFilename);

    filesScss.unshift('resources/assets/scss/_variables.scss');
    filesScssExtra.unshift('resources/assets/scss/_variables.scss');

    var contentScss      = '';
    var contentScssAsync = '';
    var contentJs        = '';
    filesScss.forEach(function (file) {
        file = '../../../' + file.replace('.css', '');
        contentScss += '@import "' + file + '";\n'
    });
    filesScssExtra.forEach(function (file) {
        file = '../../../' + file.replace('.css', '');
        contentScssAsync += '@import "' + file + '";\n'
    });
    filesJs.forEach(function (file) {
        contentJs += fs.readFileSync(file, 'utf8') + '\n';
    });

    var jsCode;
    if (isProduction()) {
        jsCode = uglifyJS.minify(contentJs, {fromString: true}).code;
    }
    else {
        jsCode = contentJs;
    }

    // Write to file
    fs.writeFileSync('public/assets/styles/styles.scss', contentScss);
    fs.writeFileSync('public/assets/styles/extra.scss', contentScssAsync);
    fs.writeFileSync('public/assets/scripts/scripts.js', jsCode);

    function processScss(path) {
        if (pth.extname(path) == '.scss') {
            if (pth.basename(path)[0] !== '_') {
                if (path.indexOf('.extra.scss') !== -1) {
                    filesScssExtra.push(path)
                }
                else {
                    filesScss.push(path)
                }
            }
        }
    }

    function processJs(path) {
        if (pth.extname(path) == '.js') {
            filesJs.push(path)
        }
    }

    function processDirectory(path, callback) {
        var list = fs.readdirSync(path);
        list.forEach(function (f) {
            var file = path + pth.sep + f;
            if (fs.statSync(file).isDirectory()) {
                processDirectory(file, callback);
            }
            else {
                callback(file);
            }
        });
    }

    function sortByFilename(a, b) {
        var partsA = a.split('/');
        var partsB = b.split('/');

        var weightA = getGroupWeight(a, partsA);
        var weightB = getGroupWeight(b, partsB);

        // Sort by group
        if (weightA != weightB) {
            return weightA - weightB;
        }

        return (partsA[partsA.length - 1].localeCompare(partsB[partsB.length - 1]));

        function getGroupWeight(path, pathParts) {
            if (pathParts[0] == 'public' && pathParts[1] == 'assets') {
                return 10;
            }
            if (pathParts[0] == patternsDir || path.indexOf(patternsDir) === 0) {
                return 20;
            }
            if (pathParts[0] == 'resources') {
                if (pathParts[1] == 'assets') {
                    return 30;
                }
                if (pathParts[1] == 'instances') {
                    return 40;
                }
            }
            // This should not happen
            console.log('=== Set group weight for this file! ===');
            console.log(pathParts);
            return 100;
        }
    }
});