var GenericScheduler = require('./GenericScheduler').class;
var parseConfigDBManager = require('../db/ParseConfigDBManager').instance;
var parseDataDBManager = require('../db/ParseDataDBManager').instance;
var scheduleDBManager = require('../db/ScheduleDBManager').instance;
var scheduleStatus = require('../models/ScheduleParseStatus.json');
var utils = require('../utils');

ScheduleParseExecutor = function() {};

ScheduleParseExecutor.prototype = Object.create(GenericScheduler.prototype);
ScheduleParseExecutor.prototype.constructor = ScheduleParseExecutor;
ScheduleParseExecutor.prototype.init = function(scheduleId) {
    this.listenerPoints = {
        pageLoadStart: 'page_load_start',
        pageLoadFinish: 'page_load_finish',
        parseStart: 'parse_start',
        parseFinish: 'parse_finish',
        parsedDataSaved: 'parse_data_saved'
    };
    this.configs = {};
    this._scheduleId = scheduleId;
    this.schedule;
    this.parseConfig;
    return this;
};

/*
ScheduleParseExecutor.prototype.start = function() {
    var inst = this;
    return new Promise(function(resolve, reject) {
        if (!inst.schedule) {
            return inst.loadDependencies(inst._scheduleId).then(function() {
                inst.getCronInstance().start();
                inst.getExecutor()();
                console.info('%s: Scheduler "%s" started!', Date(Date.now()), inst.getName());
                resolve(true);
            })
        } else {
            inst.getCronInstance().start();
            inst.getExecutor()();
            console.info('%s: Scheduler "%s" started!', Date(Date.now()), inst.getName());
            resolve(true);
        }
    });
};
*/

ScheduleParseExecutor.prototype.start = function() {
    var inst = this;
    return new Promise(function(resolve, reject) {
        if (!inst.schedule) {
            return inst.loadDependencies(inst._scheduleId).then(function() {
                inst.run();
                resolve(true);
            })
        } else {
            inst.run();
            resolve(true);
        }
    });
};

ScheduleParseExecutor.prototype.updateStatus = function(status) {
    if (this.parseConfig) {
        this.schedule.status = status;
    } else {
        console.warn('UpdateStatus. There is now schedule config for schedule executor!');
    }
};

ScheduleParseExecutor.prototype.getExecutor = function() {
    var inst = this;
    return function() {
        inst.propertyChange(inst.listenerPoints.pageLoadStart);
        utils.loadDom(inst.parseConfig.url, function(error, body) {
            var entity;
            var data;
            try {
                inst.propertyChange(inst.listenerPoints.pageLoadFinish);
                data = utils.extractDataFromHtml(body, inst.parseConfig);
                inst.propertyChange(inst.listenerPoints.parseFinish);
                entity = {
                    created: Date.now(),
                    code: inst.parseConfig.code,
                    data: data
                };
                parseDataDBManager.saveByCriteria(entity, {code: inst.parseConfig.code}).then(function (id) {
                    //TODO what if error?
                    console.info('%s: Scheduler "%s" was update data.', Date(Date.now()), inst.getName());
                    inst.propertyChange(inst.listenerPoints.parsedDataSaved);
                });
            } catch(error) {
                console.error();
            }
        }, 'koi8r');
    };
};

ScheduleParseExecutor.prototype.getName = function() {
    return this.schedule.config;
};

ScheduleParseExecutor.prototype.loadDependencies = function(scheduleId) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        scheduleDBManager
            .get(scheduleId)
            .then(function (scheduleEntity) {
                    inst.schedule = scheduleEntity;
                    return parseConfigDBManager.getByCriteria({code: inst.schedule.config});
                }, function(rejectObject) {
                    reject(rejectObject);
                    //TODO implement
                })
            .catch(function (error) {
                    console.error(error.getMessage());
                })
            .then(function (config) {
                inst.parseConfig = config;
                resolve(true);
            });
    })
};

ScheduleParseExecutor.prototype._getConfig = function(code) {
    var inst = this;
    return new Promise(function(resolve) {
        if (inst.configs && inst.configs[code]) {
            resolve(inst.configs[code]);
        } else {
            parseConfigDBManager.getByCriteria({code: code}).then(function(config) {
                inst.configs[code] = config;
                resolve(config);
            })
        }
    });
};

//STEP 01
ScheduleParseExecutor.prototype._getSections = function(url) {
    var inst = this;
    var code = 'sections';
    return new Promise(function(resolve) {
        inst._loadDataByConfig(code, url).then(function(data) {
            resolve(data);
        });
    });
};

ScheduleParseExecutor.prototype._getSectionUrl = function(section) {
    return 'oz.by/' + section.code;
};

//STEP 02
ScheduleParseExecutor.prototype._getSectionPageNumber = function(section) {
    var inst = this;
    var code = 'section_page_number';
    var url = this._getSectionUrl(section);
    return new Promise(function(resolve) {
        inst._loadDataByConfig(code, url).then(function(data) {
            resolve(data);
        });
    });
};

ScheduleParseExecutor.prototype._getSectionPageUrl = function(section, index) {
    return "oz.by/" + section.code + "?page=" + index;
};

//STEP 03
ScheduleParseExecutor.prototype._getSectionItemsPreviews = function(section, index) {
    var inst = this;
    var code = 'section_page_item_preview';
    var url = this._getSectionPageUrl(section, index);
    return new Promise(function(resolve) {
        inst._loadDataByConfig(code, url).then(function(data) {
            resolve(data);
        });
    });
};

ScheduleParseExecutor.prototype._getItemUrl = function(section) {
    return 'oz.by/' + section.code + '/more' + section.id + '.html';
};

//STEP 04
ScheduleParseExecutor.prototype._getSectionItem = function(section) {
    var inst = this;
    var code = 'section_page_item';
    var url = this._getItemUrl(section);
    return new Promise(function(resolve) {
        inst._loadDataByConfig(code, url).then(function(data) {
            resolve(data);
        });
    });
};

//STEP 05
ScheduleParseExecutor.prototype._getAuthor = function() {

};

//STEP 06
ScheduleParseExecutor.prototype._getComments = function() {

};

ScheduleParseExecutor.prototype._loadDataByConfig = function(configCode, url) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst._getConfig(configCode).then(function(config) {
            utils.loadDom(url, function(error, body) {
                try {
                    resolve(utils.extractDataFromHtml(body, config));
                } catch(error) {
                    console.error();
                    reject(null);
                }
            }, 'koi8r');
        });
    })
};

ScheduleParseExecutor.prototype.run = function() {
    var inst = this;
    var handler = {
        //extract page numbers for section
        section: function(sections) {
            var index = 0;
            while(index < sections.length) {
                setTimeout((function() {
                    var section = sections[index];
                    return function() {
                        inst._getSectionPageNumber(section).then(function(number) {
                            handler.sectionPage(section, number);
                        });
                    }
                })(), 0);
                index++;
            }
        },
        //extract section items
        sectionPage: function(section, number) {
            var index = 0;
            number = +number;
            if (!isNaN(number)) {
                while(index < number) {
                    setTimeout((function() {
                        var index_ = index;
                        return function() {
                            inst._getSectionItemsPreviews(section, index_).then(function (items) {
                                handler.item(section, items);
                            });
                        }
                    })(), 0);
                    index++;
                }
            }
        },
        //extract items
        item: function(section, items) {
            var index = 0;
            while(index < items.length) {
                setTimeout((function() {
                    var item = items[index];
                    return function() {
                        inst._getSectionItem(item).then(function(filledItem) {
                            console.log(filledItem)
                        });
                    }
                })(), 0);
                index++;
            }
        }
    };
    this._getSections('oz.by', function(sectionsList) {
        if (sectionsList && sectionsList.length) {
            handler.section(sectionsList);
        }
    });

};

module.exports = {
    class: ScheduleParseExecutor
};