var u = require('../utils');
var express = require('express');
var router = express.Router();
//var service = require('../service/mainPageService');
var routes = [
    {path: '/get', method: 'main', async: true}
];

module.exports = router;

module.stuf = (function () {
    var api = null;

    function main(req, res, callback) {
        /*service.init(function() {
            var index = 2;
            var result = {};
            console.time('sections');
            service.getSections(function(data) {
                result.sections = data;
                index--;
                console.timeEnd('sections');
                if (!index) {
                    callback(result);
                }
            });
            console.time('catalog');
            service.getCatalog(function(data) {
                result.catalog = data;
                index--;
                console.time('catalog');
                if (!index) {
                    callback(result);
                }
            });
        });*/
    }

    api = {
        init: function(callback) {
            if (typeof(callback) == 'function') {
                callback();
            }
            return api;
        },
        main: function(req, res, callback) {
            main(req, res, callback);
        }
    };
    return api;
})();
u.linkRequestsToModule(routes, module.stuf, router);