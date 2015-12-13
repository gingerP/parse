var compressor = require('node-minify');
var path = require('path');
function getParams() {
    return {
        min: process.argv[2] === 'min',
        js: process.argv[3] === 'js',
        css: process.argv[3] === 'css'
    }
}

function iteratorCallback(index, cfg) {
    if (!index) {
        console.log('Compressor template "%s" was SUCCESSFULLY executed.', cfg.code);
    }
}

function minifyJs(cfg) {
    var type = !cfg.min? 'no-compress': 'gcc';
    var outFiles = _getOutFiles(cfg);
    var inFiles = _getInFiles(cfg);
    var count;
    if (cfg.concat) {
        outFiles = !cfg.concat? outFiles: outFiles[0];
        new compressor.minify({
            type: type,
            fileIn: inFiles,
            fileOut: outFiles,
            callback: function (err, min) {
                if (err) {
                    console.log('An ERROR ocurred while executing "%s" template. %s', cfg.code, err);
                } else {
                    console.log('Compressor template "%s" was SUCCESSFULLY executed.', cfg.code);
                }
            }
        });
    } else if (cfg.min) {
        count = inFiles.length;
        inFiles.forEach(function(inFile, index) {
            var outFile = outFiles[index];
            new compressor.minify({
                type: type,
                fileIn: inFile,
                fileOut: outFile,
                callback: function (err, min) {
                    if (err) {
                        console.log('An ERROR ocurred while executing "%s" template. %s', inFile, err);
                    } else {
                        iteratorCallback(--count, cfg);
                    }
                }
            });
        });
    }
}

function _getInFiles(cfg) {
    var files = [];
    cfg.in.forEach(function(file) {
        files.push(cfg.inBasePath + path.sep + file);
    });
    return files;
}

function _getOutFiles(cfg) {
    var files = [];
    var source;
    if (!!cfg.concat) {
        files.push(cfg.outBasePath + path.sep + cfg.out[0]);
    } else {
        source = !cfg.out || !cfg.out.length? cfg.in: cfg.out;
        source.forEach(function(file) {
            files.push(cfg.outBasePath + path.sep + file);
        });
    }
    return files;
}

function minifyCss() {

}

var params = getParams();
var config = [
    {code: 'core', inBasePath: 'web/js/core', outBasePath: 'web/min/js', concat: true, min: true, in: [
        'v-common.js', 'v-core-rules.js', 'v-core-form.js', 'v-core-grid.js', 'v-core-service.js', 'v-core-toolbar.js', 'v-core-feature.js'
    ], out: ['v-core.js']},
    {code: 'service', inBasePath: 'web/js/service', outBasePath: 'web/min/js/service', min: true, in: [
        'CoreService.js', 'ConstructorService.js', 'LevelService.js'
    ], out: []},
    {code: 'views', inBasePath: 'web/js/views', outBasePath: 'web/min/js/views', min: true, in: [
        'module-cache.js', 'module-constructors.js', 'module-schedules.js', 'module-sys-settings.js'
    ], out: []},
    {code: 'views-deps', inBasePath: 'web/js/views-dependencies/constructor', outBasePath: 'web/min/js/views-dependencies/constructor', min: true, in: [
        'module-business.js', 'module-view-level.js', 'module-view-levels-config.js', 'module-view-src-editor.js', 'module-view-test-data-viewer.js'
    ], out: []},
    {code: 'sys', inBasePath: 'web/js', outBasePath: 'web/min/js', min: true, in: [
        'app.js', 'utils.js'
    ], out: []}
];
if (process.argv) {
    if (params.min) {
        if (params.js) {
            config.forEach(function(cfg) {
                minifyJs(cfg);
            });
        } else if (params.css) {
            minifyCss();
        } else {
            config.forEach(function(cfg) {
                minifyJs(cfg);
            });
            minifyCss();
        }
    }
}