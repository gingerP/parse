var u = require('../utils');
var c = require('../constants');
/*var DataDBM = require('../db/ParseDataDBManager');*/
    
module.exports = (function () {
    var api = null;
    /*var dataDBM = new DataDBM();*/

    function getSections(callback) {
        console.time('getSections');
        /*dataDBM.getEntity({code: 'sections'}, function(entity) {
            var data = {};
            if (entity) {
                data = entity.data;
            }
            console.timeEnd('getSections');
            callback(data);
        });*/
    }

    function getCatalog(callback) {
        /*dataDBM.getEntity({code: 'catalog'}, function(entity) {
            var data = {};
            if (entity) {
                data = entity.data;
            }
            callback(data);
        });*/
    }


    api = {
        init: function(callback) {
            if (typeof(callback) == 'function') {
                callback();
            }
            return api;
        },
        getSections: function(callback) {
            return getSections(callback);
        },
        getCatalog: function(callback) {
            return getCatalog(callback);
        }
    };

    return api;
})();
