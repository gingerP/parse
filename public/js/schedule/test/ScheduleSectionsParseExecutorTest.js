var configDBManager= require('../../db/ParseConfigDBManager').instance;
var steps = [
    require('../ScheduleSectionsParseExecutorSteps/SectionStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionNumberStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionPageItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/ItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/AuthorStep').class
];
var utils = require('../../utils');
var sectionsScheduleExtend = require('../../models/SectionsScheduleExtend.json');
var ws_;
function ws() {
    if (!ws_) {
        ws_ = require('../../common/WSServer').instance();
    }
    return ws_;
}
ScheduleSectionsParseExecutorTest = function() {};

//TODO older version
/*
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
                    if (prevLevelResult.RESULT) {
                        if (Array.isArray(prevLevelResult.RESULT)) {
                            prevLevelResult.RESULT.forEach(function() {
                                new steps[currentIndex]().run(inst.getStepDependenciesCallback(schedule, stepCode, prevLevelResult));
                            });
                        } else {
                            return new steps[currentIndex]().run(inst.getStepDependenciesCallback(schedule, stepCode, prevLevelResult));
                        }
                    }
                    return new Promise(function(resolve) {
                        resolve();
                    });
                }
            }());
            currentStepIndex++;
        }
        step.then(function(result) {
            resolve(result);
        });
    })
};
*/

//TODO actual version
ScheduleSectionsParseExecutorTest.prototype.run = function(schedule, extend) {
    var inst = this;
    var destIndex = this._getStepIndex(extend.stepCode);
    var maxIteration = parseInt(extend.maxIteration);
    if (utils.hasContent(destIndex)) {
        console.warn('Using default depth level "0" for testing purpose.');
        destIndex = 0;
    }
    if (isNaN(maxIteration)) {
        console.warn('Using default max iteration "1" for testing purpose.');
        maxIteration = 1;
    }
    return new Promise(function(resolve) {
        inst._run(schedule, 0, null, destIndex, maxIteration, function(result) {
            resolve(result);
        });
    })
};

ScheduleSectionsParseExecutorTest.prototype._run = function(schedule, index, prevStepRes, destIndex, maxIteration, callback) {
    var stepCode;
    var inst = this;
    var prev = [];
    if (prevStepRes) {
        prev = Array.isArray(prevStepRes.RESULT)? prevStepRes.RESULT: [prevStepRes.RESULT];
    } else if (!index) {
        prev = [null];
    }
    if (index >= steps.length) {
        return;
    }
    stepCode = this._getHandlerByIndex(index, schedule);
    if (stepCode) {
        stepCode = stepCode.code;
        prev.forEach(function(prevResult, resItemIndex) {
            if (resItemIndex <= maxIteration) {
                new steps[index]().run(inst.getStepDependenciesCallback(schedule, stepCode, prevResult)).then(function (result) {
                    if (index == destIndex && !resItemIndex) {
                        setTimeout(function() {
                            console.log('!!!!!!!!!!!!!!!!!!');
                            callback(result);
                        }, 0);
                    }
                    if (index < destIndex) {
                        inst._run(schedule, index + 1, result, destIndex, maxIteration, callback);
                    }
                }, function(message) {
                    ws().propertyChange('parse_error', message);
                    //TODO
                });
            }
        });
    }
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
ScheduleSectionsParseExecutorTest.prototype._getHandlerByIndex = function(index, schedule) {
    return schedule.extend && schedule.extend.handlers && schedule.extend.handlers.length > index? schedule.extend.handlers[index]: null;
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