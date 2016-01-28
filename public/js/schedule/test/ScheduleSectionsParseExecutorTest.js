var configDBManager= require('../db/ParseConfigDBManager').instance;
var steps = [
    require('../ScheduleSectionsParseExecutorSteps/SectionStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionNumberStep').class,
    require('../ScheduleSectionsParseExecutorSteps/SectionPageItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/ItemStep').class,
    require('../ScheduleSectionsParseExecutorSteps/AuthorStep').class
];

ScheduleSectionsParseExecutorTest = function() {};

ScheduleSectionsParseExecutorTest.prototype.run = function(schedule, extend) {
    var inst = this;
    var stepNumber = extend.stepNumber;
    var currentStepIndex = 0;
    var step = new steps[currentStepIndex]().run(inst.getStepDependenciesCallback(schedule, currentStepIndex));
    currentStepIndex++;
    while(currentStepIndex <= stepNumber) {
        step.then(function() {
            var currentIndex = currentStepIndex;
            return function(prevLevelResult) {
                return new steps[currentIndex]().run(inst.getStepDependenciesCallback(schedule, currentIndex, prevLevelResult));
            }
        }());
        currentStepIndex++;
    }
    return step;
};

ScheduleSectionsParseExecutorTest.prototype.getStepDependenciesCallback = function(schedule, stepNumber, prevLevelResult) {
    var inst = this;
    return function() {
        var result = {
            schedule: schedule,
            config: null,
            prevLevelResult: prevLevelResult
        };
        var configCode = inst._getConfigCode(schedule, stepNumber);
        if (configCode) {
            return configDBManager.getByCriteria({code: configCode}).then(function(config) {
                result.config = config;
                return result;
            })
        } else {
            return new Promise(function(resolve, reject) {
                //TODO
                resolve(result);
            });
        }
    }
};

ScheduleSectionsParseExecutorTest.prototype._getConfigCode = function(schedule, index) {
    var result = null;
    if (schedule && schedule.extend && schedule.extend.handlers && schedule.extend.handlers.length >= index) {
        result = schedule.extend.handlers[index].config;
    }
    return result;
};