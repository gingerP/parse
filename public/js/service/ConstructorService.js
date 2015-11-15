var u = require('../utils');
var c = require('../constants');
var ConfigDBM = require('../db/ParseConfigDBManager');
var express = require('express');
var router = express.Router();
var routes = [
    {path: '/list', method: 'list', async: true},
    {path: '/getEntity', method: 'getEntity', async: true},
    {path: '/save', method: 'save', async: true},
    {path: '/delete', method: 'delete', async: true}
];

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
            configDBM.getEntity({_id: id}, callback, mappings);
            return api;
        },
        delete: function(req, res, callback) {
            configDBM.delete(filter, callback);
            return api;
        }
    };

    return api;
})();

module.exports = router;
u.linkRequestsToModule(routes, module.stuf, router, 'post');
