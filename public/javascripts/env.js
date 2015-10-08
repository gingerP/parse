var scheduleService = require('./service/ScheduleService');
var ScheduleParseExecutor = require('./modules/ScheduleParseExecutor');
env = (function() {
    var api = null;
    var executors = [];

    function _start() {
        executors.forEach(function(executor) {
            executor.start();
        })
    }

    function init() {
        var catalogSchedule = scheduleService.createNewEntity({
            period: '2m',
            lastTimeStart: null,
            lastTimeEnd: null,
            configCode: 'catalog'
        });
        var sectionsSchedule = scheduleService.createNewEntity({
            period: '2m',
            lastTimeStart: null,
            lastTimeEnd: null,
            configCode: 'sections'
        });
        scheduleService.update(catalogSchedule, function() {
            scheduleService.update(sectionsSchedule, function() {
                scheduleService.startAllSchedules(function(list) {
                    var count = null;
                    if (list && list.length) {
                        count = list.length;
                        list.forEach(function(shedule) {
                            var executor = new ScheduleParseExecutor().init(shedule, function() {
                                count--;
                                if (count == 0) {
                                    _start();
                                }
                            });
                            executors.push(executor);
                        })
                    }
                });
            });
        });

    }

    api = {
        init: function() {
            init();
        }
    };
    return api;
})();

module.exports = env;