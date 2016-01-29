var configDBManager= require('../../db/ParseConfigDBManager').instance;
var steps = [
    require('../ScheduleSectionsParseExecutorSteps/SectionStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionNumberStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionPageItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/ItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/AuthorStep').class
];
var sectionsScheduleExtend = require('../../models/SectionsScheduleExtend.json');

ScheduleSectionsParseExecutorTest = function() {};

ScheduleSectionsParseExecutorTest.prototype.run = function(schedule, extend) {
    var inst = this;
    var stepCode = extend.stepCode;
    var stepIndex = this._getStepIndex(stepCode);
    var currentStepIndex = 0;
    return new Promise(function(resolve) {
        var step = new steps[currentStepIndex]().run(inst.getStepDependenciesCallback(schedule, stepCode));
        currentStepIndex++;
        while(currentStepIndex <= stepIndex) {
            step = step.then(function() {
                var currentIndex = currentStepIndex;
                var stepCode = sectionsScheduleExtend.handlers[currentIndex].code;
                return function(prevLevelResult) {
                    return new steps[currentIndex]().run(inst.getStepDependenciesCallback(schedule, stepCode, prevLevelResult));
                }
            }());
            currentStepIndex++;
        }
        step.then(function(result) {
            resolve(result);
        });
    })
};

ScheduleSectionsParseExecutorTest.prototype.getStepDependenciesCallback = function(schedule, stepCode, prevLevelResult) {
    var inst = this;
    return {
        get: function () {
            var configCode = inst._getConfigCode(stepCode, schedule);
            var result = {
                schedule: schedule,
                config: null,
                prevLevelResult: prevLevelResult,
                handler: inst._getHandler(stepCode, schedule)
            };
            if (configCode) {
                return configDBManager.getByCriteria({code: configCode}).then(function (config) {
                    result.config = config;
                    return result;
                })
            } else {
                return new Promise(function (resolve, reject) {
                    //TODO
                    resolve(result);
                });
            }
        }
    }
};

//TODO refactoring
ScheduleSectionsParseExecutorTest.prototype._getHandler = function(stepCode, schedule) {
    var index = 0;
    while(index  < schedule.extend.handlers.length) {
        if (schedule.extend.handlers[index].code === stepCode) {
            return schedule.extend.handlers[index];
        }
        index++;
    }
};

//TODO refactoring
ScheduleSectionsParseExecutorTest.prototype._getConfigCode = function(stepCode, schedule) {
    var index = 0;
    while(index  < schedule.extend.handlers.length) {
        if (schedule.extend.handlers[index].code === stepCode) {
            return schedule.extend.handlers[index].config;
        }
        index++;
    }
};

//TODO refactoring
ScheduleSectionsParseExecutorTest.prototype._getStepIndex = function(stepCode) {
    var index = 0;
    while(index  < sectionsScheduleExtend.handlers.length) {
        if (sectionsScheduleExtend.handlers[index].code === stepCode) {
            return index;
        }
        index++;
    }
};

module.exports = {
    class: ScheduleSectionsParseExecutorTest
};