var ScheduleDBM = require('../db/ScheduleDBM');
var u = require('../utils');

scheduleModule = (function() {
    var api = null;
    var scheduleDBM = new ScheduleDBM();

    function startAll(callback) {
        scheduleDBM.list(function(list) {
            if (typeof(callback) == 'function') {
                callback(list);
            }
        });
    }

    api = {
        init: function() {

        },
        startAllSchedules: function(callback) {
            startAll(callback);
        },
        startSchedule: function(callback) {

        },
        createNewEntity: function(obj) {
            var entity = {
                period: null,
                lastTimeStart: null,
                lastTimeEnd: null,
                configCode: null
            };
            if (obj) {
                u.merge(entity, obj);
            }
            return entity;
        },
        saveEntity: function(entity, callback) {
            scheduleDBM.saveEntity(entity, callback);
        },
        saveEntities: function(entities) {
            scheduleDBM.saveEntities(entities);
        },
        delete: function() {

        },
        list: function() {

        }
    };

    return api;
})();

module.exports = scheduleModule;