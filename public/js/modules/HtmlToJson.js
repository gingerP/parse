var utils = require('../utils');
var assert = require('assert');
var validate = {
    position: function(position) {
        if (isNaN(position * 1)) {
            throw new Error('Invalid position "' + position + '" - must be numeric (+n , n, -n)');
        }
    },
    levelCode: function(code, level) {
        if (utils.hasContent(code) && !utils.hasContent(level)) {
            throw new Error("There is no level for code '" + code + "'");
        }
    }
};


HtmlToJson = function () {
    this.parser = null;
};

HtmlToJson.prototype.get = function (domString, config) {
    var parentSelector = utils.hasContent(config.parentSel)? config.parentSel: 'html';
    this.$ = this._initParser(domString);
    this.levelCfg = config.levelConfig;
    this.levels = config.levels;
    this.listKey = config.listKey || "list";
    console.time("extract");
    var zzz = this._getData(this.$(parentSelector));
    console.timeEnd("extract");
    return zzz;
};

HtmlToJson.prototype._initParser = function (domString) {
    this.parser = require('cheerio');
    return this.parser.load(domString);
};

HtmlToJson.prototype._getData = function (dom) {
    var inst = this;
    var result = [];
    if (this.levelCfg && this.levelCfg.length) {
        this.levelCfg.forEach(function(cfg) {
            result.push(inst._iterateLevels(dom, cfg));
        });
    }
    return result;
};

HtmlToJson.prototype._iterateLevels = function (dom, levelsCfg) {
    var inst = this;
    var $ = this.$;
    var level = inst._getLevelByCode(levelsCfg.node, inst.levels);
    validate.levelCode(levelsCfg.node, level);
    var pack = inst._handleLevel(dom, level);
    var children = levelsCfg.children;
    if (pack.DOMList.length && children && children.length) {
        children.forEach(function (child, index) {
            var inst_ = inst;
            pack.DOMList.each(function(index, DOM) {
                var childKey = inst._getLevelListKey(child, inst.levels) || utils.getRandomString();
                var data = pack.objects[index];
                if (utils.hasContent(data)) {
                    data[childKey] = data[childKey] || [];
                    data[childKey] = data[childKey].concat(inst_._iterateLevels(DOM, child));
                }
            });
        });
    }
    return pack.objects;
};

HtmlToJson.prototype._handleLevel = function (dom, level) {
    var dataObjects = [];
    var inst = this;
    var DOMNodes = this._handlePath(dom, level.path);
    if (DOMNodes && DOMNodes.length) {
        DOMNodes.each(function(i, DOM) {
            var valid = inst._handleFilter(DOM, level.filter);
            if (valid) {
                var data = inst._handleData(DOM, level.data);
                if (utils.hasContent(data)) {
                    dataObjects[i] = data;
                }
            }
        })
    }
    return {
        DOMList: DOMNodes || [],
        objects: dataObjects
    };
};

HtmlToJson.prototype._handlePath = function (dom, path) {
    var inst = this;
    var stepsRes = [dom];
    var incorrect = false;
    if (path && path.length) {
        path.forEach(function (step, index) {
            var parent = stepsRes[index];
            var child = inst._pathHandlers[step.type].call(inst, parent, step, inst.$);
            if (!child || !child.length) {
                incorrect = true;
                return false;
            }
            stepsRes.push(child);
        });
    }
    return incorrect? null: stepsRes.pop();
};

HtmlToJson.prototype._handleFilter = function(DOM, filters) {
    var result = true;
    var $ = this.$;
    var inst = this;
    if (filters && filters.length) {
        filters.forEach(function (filter, i) {
            var complexSelector = inst._getComplexSelector(filter.selectors);
            result = result && !!$(complexSelector, DOM).length;
            return result;
        })
    }
    return result;
};

HtmlToJson.prototype._handleData = function(DOM, dataCfg) {
    var result = {};
    var $ = this.$;
    var inst = this;
    if (dataCfg && dataCfg.length) {
        dataCfg.forEach(function (cfg, i) {
            var context;
            if (!utils.hasContent(cfg.handler)) {
                result[cfg.name] = '';
                return;
            }
            var complexSelector = inst._getComplexSelector(cfg.selectors);
            var children = DOM;
            if (utils.hasContent(complexSelector)) {
                children = $(complexSelector, DOM);
            }
            var handler = inst._dataHandlers[cfg.handler];
            result[cfg.name] = handler.call(inst, children, cfg, $, inst);
            if (utils.hasContent(cfg.userFormatter)) {
                context = {
                    RESULT: result[cfg.name] || ''
                };
                utils.eval(cfg.userFormatter, context);
                result[cfg.name] = context.RESULT;
            }
        });
    }
    return result;
};

HtmlToJson.prototype._pathHandlers = {
    sibl: function(dom, step, $) {
        var result = null;
        var position = null;
        var direction = null;
        var getSiblingByPosition = function(sibl, position, direction) {
            if (!sibl.length) {
                return null;
            }
            if (direction > -1 && sibl.length > position) {
                return [sibl[position]];
            }
            if (direction < 0 && sibl.length > position * (-1)) {
                return [sibl[sibl.length + position]];
            }
        };
        var getSiblingsByDirection = function(dom, direction) {
            if (direction > 0) {
                return $(dom).nextAll();
            } else if (direction < 0) {
                return $(dom).prevAll();
            } else {
                return $(dom).siblings();
            }
        };
        var getDirection = function (position) {
            if (position.indexOf('-') == 0) {
                return -1;
            } else if (position.indexOf('+') == 0) {
                return 1;
            } else {
                return 0;
            }
        };
        var complexSelector = this._getComplexSelector(step.selectors);
        if (utils.hasContent(step.pos)) {
            validate.position(step.pos);
            step.pos = step.pos.trim();
            direction = getDirection(step.pos);
            position = parseInt(step.pos);
            if (position === 0) {
                return dom;
            }
            position--;
            result = getSiblingsByDirection(dom, direction);
            if (!result.length) {
                return null;
            }
            if (utils.hasContent(complexSelector)) {
                result = result.filter(complexSelector);
            }
            return getSiblingByPosition(result, position, direction);
        } else {
            return $(dom).siblings(complexSelector);
        }
    },
    up: function(dom, step, $) {
        var position = null;
        var result = null;
        var complexSelector;
        if (utils.hasContent(step.pos)) {
            position = parseInt(step.pos);
            for(var index = 0; index < position; index++) {
                result = $(dom).parent();
            }
        }
        complexSelector = this._getComplexSelector(step.selectors);
        if (utils.hasContent(complexSelector)) {
            if (!result) {
                result = result.parent(complexSelector);
            } else {
                result = $(dom).parent(complexSelector);
            }
        }
        return result;
    },
    down: function(dom, step, $) {
        var complexSelector = this._getComplexSelector(step.selectors);
        return $(complexSelector, dom);
    }
};

HtmlToJson.prototype._dataHandlers = {
    val: function(dom, cfg, $) {
        if (dom) {
            return utils.cleanStr($(dom).text());
        }
        return '';
    },
    attribute: function(dom, cfg, $) {
        if (dom) {
            return utils.cleanStr($(dom).attr(cfg.attribute));
        }
        return '';
    },
    notNull: function(dom, cfg, $) {
        if (dom) {
            return !!dom.length;
        }
        return false;
    },
    htmlStr: function(dom, cfg, $) {
        if (dom) {
            return utils.cleanStr($(dom).text());
        }
        return '';
    },
    style: function(dom, cfg, $) {
        var attrVal = null;
        var style = cfg.style;
        var handlers = this._styleHandlers;
        if (dom && typeof(handlers[style]) == 'function') {
            attrVal = $(dom).attr("style");
            return handlers[style].call(this, attrVal);
        }
        return '';
    }
};

HtmlToJson.prototype._styleHandlers = {
    backgroundUrl: function(style) {
        var matches = /url\('(.*)'\)/g.exec(style);
        if (matches && matches.length > 1) {
            return matches[1];
        }
        return '';
    }
};

HtmlToJson.prototype._getComplexSelector = function(selectors) {
    var result = [];
    if (selectors && selectors.length) {
        selectors.forEach(function(selector) {
            if (selector.selector) {
                result.push(selector.selector);
            }
        });
        result = result.join(', ');
    }
    return result;
};

HtmlToJson.prototype._getLevelByCode = function(code, levels) {
    var result;
    if (levels && levels.length) {
        levels.forEach(function(level) {
            if (level.code == code) {
                result = level;
                return;
            }
        });
    }

    return result;
};

HtmlToJson.prototype._getLevelListKey = function(child, levels) {
    var level = this._getLevelByCode(child.node, levels);
    return level? level.listKey: null;
};

module.exports = HtmlToJson;