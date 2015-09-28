var u = require('../utils');
var c = require('../constants');
var express = require('express');
var router = express.Router();
var catalogCfg = require('./catalog.json');
var sectionCfg = require('./sections.json');
module.exports = router;

module.stuf = (function () {
    var api = null;

    function parseSections(body) {
        var sections = u.extractDataFromHtml(body, sectionCfg);
        return sections;
    }

    function parseCatalog(body) {
        var catalog = u.extractDataFromHtml(body, catalogCfg);
        return catalog;
    }

    function main(req, res, callback) {
        console.time('parse');
        u.loadDom(c.OZ_HOME, function(body) {
            console.timeEnd('parse');
            var result = {
                sections: parseSections(body),
                catalog: parseCatalog(body)
            };
            callback(result);
        }, 'koi8r');
    }

    api = {
        init: function() {

        },
        main: function(req, res, callback) {
            main(req, res, callback);
        }
    };
    return api;
})();

(function(module) {
    var routes = [
        {path: '/get', method: 'main', async: true}
    ];
    routes.forEach(function(rout) {
        router.get(rout.path, (function() {
            var rt = rout;
            return function(req, res) {
                if (rt.async) {
                    module[rt.method](req, res, function(data) {
                        res.send(data);
                    })
                } else {
                    res.send(module[rt.method](req, res));
                }
            }
        })())
    })

})(module.stuf);