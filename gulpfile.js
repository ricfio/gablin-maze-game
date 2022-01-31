const gulp = require('gulp');
const tsc = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge_stream = require('merge-stream');

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');

// const gulp_concat = require('gulp-concat');
// const gulp_clean_css = require('gulp-clean-css');
// const gulp_javascript_obfuscator = require('gulp-javascript-obfuscator');
//
const { src, dest } = require('gulp');
const { series } = require('gulp');
//
var fs = require('fs');

//
const output_dist = 'public/dist';
//const output_test = 'public/test';

/**
 * Delete **all folder, subfolder and files** in a specific path. (this is a recursive function)
 * @param {string} path Path to the folder to delete
 */
function rmdir(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recursive function
                rmdir(curPath);
            } else {
                // remove the file
                fs.unlinkSync(curPath);
            }
        });
        // remove the empty directory
        fs.rmdirSync(path);
    }
}

/**
 * Clean
 */
function clean(cb) {
    rmdir(output_dist);
    cb();
}

function obfuscator(options) {
    const obfuscator_options = ((options) ? options : {
        compact: true,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'mangled',
        log: false,
        renameGlobals: false,
        rotateStringArray: false,
        selfDefending: false,
        stringArray: false,
        stringArrayEncoding: 'base64',
        stringArrayThreshold: 0.75,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
        seed: 164823597130, // TODO: Add a random seed (timestamp) ?
    });
    return gulp_javascript_obfuscator(obfuscator_options);
}

function obfuscate(source, target, cb) {
    const obfuscator_options = {
        compact: true,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'mangled',
        log: false,
        renameGlobals: false,
        rotateStringArray: false,
        selfDefending: false,
        stringArray: false,
        stringArrayEncoding: 'base64',
        stringArrayThreshold: 0.75,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
        seed: 164823597130, // TODO: Add a random seed (timestamp) ?
    };
    gulp.src(source)
        .pipe(gulp_javascript_obfuscator(obfuscator_options))
        .pipe(gulp.dest(target))
        .on("end", () => {
            cb();
        });
}

/**
 * MAKE dist/game/*.js
 */
function make_game(cb) {
    // const tsProject = tsc.createProject('tsconfig.json');
    // var tsResult = gulp.src(['src/**/*.ts'])
    //     .pipe(sourcemaps.init())
    //     .pipe(tsProject());
    // return merge_stream(tsResult, tsResult.js)
    //     .pipe(sourcemaps.write('.'))
    //     .pipe(gulp.dest(`${output_dist}/game`));    

        return browserify({
            basedir: '.',
            debug: true,
            entries: ['src/main.ts'],
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('game.js'))
        .pipe(dest(`${output_dist}`));
}

/**
 * COPY 3pp libraries
 */
function copy_lib(cb) {
    src([
        'lib/pixi_v5.1.1/pixi.min.js',
        'lib/pixi_v5.1.1/pixi.min.js.map',
        'lib/pixi-sound_v3.0.3/pixi-sound.js',
        'lib/pixi-sound_v3.0.3/pixi-sound.js.map',
        'lib/various/scaleToWindow.js',
    ]).pipe(dest(`${output_dist}/lib`));
    cb();
}

/**
 * COPY resources
 */
function copy_res(cb) {
    src('res/**/*').pipe(dest(`${output_dist}/res`));
    cb();
}

//
exports.clean              = clean;
//
exports.copy_lib           = copy_lib;
exports.copy_res           = copy_res;
exports.make_game          = make_game;
//
exports.dist               = series(clean, make_game, copy_lib, copy_res);
//
exports.default            = exports.make_game;

/**
 * Watch task: look for changes in ts file and recompile it if necessary
 */
exports.watch = function() {
    gulp.watch(['lib/**/*.*'], exports.copy_lib);
    gulp.watch(['res/**/*.*'], exports.copy_res);
    gulp.watch(['src/**/*.ts'], exports.make_game);
}
