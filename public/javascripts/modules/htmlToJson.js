var u = require('../utils');
HtmlToJson = function () {
    this.parser = null;
};

HtmlToJson.prototype.get = function (domString, config) {
    this.$ = this._initParser(domString);
    this.levelCfg = config.levelConfig;
    this.levels = config.levels;
    this.listKey = config.listKey || "list";
    console.time("extract");
    var zzz = this._getData(this.$(config.parentSel));
    console.timeEnd("extract");
    return zzz;
};

HtmlToJson.prototype._initParser = function (domString) {
    this.parser = require('cheerio');
    return this.parser.load(domString);
};

HtmlToJson.prototype._getData = function (dom) {
    return this._iterateLevels(dom, this.levelCfg);
};

HtmlToJson.prototype._iterateLevels = function (dom, levelsCfg) {
    var inst = this;
    var $ = this.$;
    var level = inst.levels[levelsCfg.node];
    var pack = inst._handleLevel(dom, level);
    var children = levelsCfg.children;
    var listKey = level.listKey || this.listKey;
    if (pack.DOMList.length && children && children.length) {
        children.forEach(function (child, i) {
            pack.DOMList.each(function(i, DOM) {
                var data = pack.objects[i];
                data[listKey] = data[listKey] || [];
                data[listKey] = data[listKey].concat(inst._iterateLevels(DOM, child));
            });
        });
    }
    return pack.objects;
};

HtmlToJson.prototype._handleLevel = function (dom, level) {
    var dataObjects = [];
    var inst = this;
    var $ = this.$;
    var DOMNodes = this._handlePath(dom, level.path);
    var pack = null;
    if (DOMNodes && DOMNodes.length) {
        DOMNodes.each(function(i, DOM) {
            var valid = inst._handleFilter(DOM, level.filter);
            if (valid) {
                var data = inst._handleData(DOM, level.data);
                if (data) {
                    dataObjects.push(data);
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
    path.forEach(function (step, index) {
        var parent = stepsRes[index];
        var child = inst._pathHandlers[step.type](parent, step, inst.$);
        if (!child || !child.length) {
            incorrect = true;
            return false;
        }
        stepsRes.push(child);
    });
    return incorrect? null: stepsRes.pop();
};

HtmlToJson.prototype._handleFilter = function(DOM, filters) {
    var result = true;
    var $ = this.$;
    if (filters && filters.length) {
        filters.forEach(function (filter, i) {
            result = result && !!$(filter.sel, DOM).length;
            return result;
        })
    }
    return result;
};

HtmlToJson.prototype._handleData = function(DOM, dataCfg) {
    var $ = this.$;
    var inst = this;
    var result = {};
    var cfg = null;
    var name = null;
    dataCfg.forEach(function (cfg, i) {
        var children = DOM;
        if (u.hasContent(cfg.sel)) {
            children = $(cfg.sel, DOM);
        }
        var handler = inst._dataHandlers[cfg.handler];
        result[cfg.name] = handler(children, cfg, $, inst);
    });
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
        if (u.hasContent(step.pos)) {
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
            if (u.hasContent(step.sel)) {
                result = result.filter(step.sel);
            }
            return getSiblingByPosition(result, position, direction);
        } else {
            return $(dom).siblings(step.sel);
        }
    },
    up: function(dom, step, $) {
        var position = null;
        var result = null;
        if (u.hasContent(step.pos)) {
            position = parseInt(step.pos);
            for(var index = 0; index < position; index++) {
                result = $(dom).parent();
            }
        }
        if (u.hasContent(step.sel)) {
            if (!result) {
                result = result.parent(step.sel);
            } else {
                result = $(dom).parent(step.sel);
            }
        }
        return result;
    },
    down: function(dom, step, $) {
        var sel = step.sel;
        if (u.isArray(step.sel)) {
            sel = step.sel.join(',');
        }
        return $(sel, dom);
    }
};

HtmlToJson.prototype._dataHandlers = {
    val: function(dom, cfg, $) {
        if (dom) {
            return u.cleanStr($(dom).text());
        }
        return '';
    },
    attr: function(dom, cfg, $) {
        if (dom) {
            return u.cleanStr($(dom).attr(cfg.attr));
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
            return u.cleanStr($(dom).text());
        }
        return '';
    },
    style: function(dom, cfg, $, inst) {
        var attrVal = null;
        var style = cfg.style;
        var handlers = inst._styleHandlers;
        if (dom && typeof(handlers[style]) == 'function') {
            attrVal = $(dom).attr("style");
            return handlers[style](attrVal);
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

module.exports = HtmlToJson;