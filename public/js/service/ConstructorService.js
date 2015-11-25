var u = require('../utils');
var c = require('../constants');
var ConfigDBM = require('../db/ParseConfigDBManager');
var express = require('express');
var router = express.Router();
var routes = [
    {path: '/list', method: 'list', async: true},
    {path: '/getEntity', method: 'getEntity', async: true},
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'delete', async: true},
    {path: '/test', method: 'test', async: true}
];

function runTest(config, callback) {
    var url = config.url;
    console.log('START test loading and parsing for config "' + config.code + '(' + config._id + ')"');
    u.loadDom(url, function(error, body) {
        var data;
        if (typeof(callback) == 'function') {
            if (error) {
                console.log('FINISH test loading and parsing for config "' + config.code + '(' + config._id + ')" with error ' + error.message);
                callback(error);
                return;
            }
            data = u.extractDataFromHtml(body, config);
            console.log('FINISH test loading and parsing for config "' + config.code + '(' + config._id + ')"');
            callback(error, data);
        }
    }, 'koi8r');
}

module.stuf = (function () {
    var api = null;
    var configDBM = new ConfigDBM();

    api = {
        list: function(req, res, callback) {
            var mappings = req.body.mappings;
            configDBM.list(callback, mappings);
            return api;
        },
        save: function(req, res, callback) {
            var entity = req.body;
            configDBM.update(entity, callback);
            return api;
        },
        getEntity: function(req, res, callback) {
            var id = req.body.id;
            var mappings = req.body.mappings;
            configDBM.getEntity(id, callback, mappings);
            return api;
        },
        delete: function(req, res, callback) {
            configDBM.delete(filter, callback);
            return api;
        },
        test: function(req, res, callback) {
            var id = req.body.id;
            configDBM.getEntity(id, function(config) {
                runTest(config, function(error, parsedData) {
                    //TODO shit
                    callback(error? error: parsedData);
                })
            });
        }
    };

    return api;
})();

module.exports = router;
u.linkRequestsToModule(routes, module.stuf, router, 'post');
