var dependencies = {
    request: 'request',
    cheerio: 'cheerio',
    iconv: 'iconv',
    express: 'express',
    iconvLite: 'iconv-lite',
    htmlToJson: './modules/HtmlToJson'
};
function getRef(ref) {
    if (typeof(dependencies[ref]) == "string") {
        try {
            dependencies[ref] = require(dependencies[ref]);
        } catch(e) {
            console.info(e.message);
        }
    }
    return dependencies[ref];
}

var api = {
    loadDom: function(url, callback, encodeFrom) {
        console.time('load');
        getRef('iconvLite').extendNodeEncodings();
        getRef('request')({
            url: url,
            encoding: encodeFrom
        }, function (error, response, body) {
            var res = null;
            //var translator = new (getRef('iconv'))(encodeFrom, 'utf8');
            if (!error && response.statusCode == 200) {
                res = body;
                if (typeof(callback) == 'function') {
                    //  callback(translator.convert(res).toString());
                    callback(res);
                }
            } else {
                console.warn("Could NOT CONNECT to " + url);
            }
            console.timeEnd('load');
        });
    },
    parseHtml: function(string) {
        var htmlParser = getRef('cheerio');
        return htmlParser.load(string);
    },
    extractDataFromHtml: function (dom, cfg, callback) {
        var Parser = getRef('htmlToJson');
        if (typeof(callback) == 'function') {
            setTimeout(function() {
                callback(new Parser().get(dom, cfg));
            }, 0)
        } else {
            return new Parser().get(dom, cfg);
        }
    },
    _extractDataFromHtml: function(dom, cfg, mainSelector, childrenKey) {
        var doc = this.parseHtml(dom);
        var html = doc(mainSelector, dom);
        var result = {};
        if (html.length) {
            iterateDom(html[0], result, cfg.levelConfig);
        }
        return result;
    },
    _private: {
        _parseExtract: function(dom, level) {
            var objects = doc(level.down, dom);
            var res = [];
            for(var index = 0; index < objects.length; index++) {
                res.push(this._parseHandleData(objects[index], level.data));
            }
            return {
                DOMList: objects || [],
                itemList: res,
            };
        },
        _parseIterateDom: function (dom, data, levelCfg) {
            var pack = this._parseExtract(dom, levelCfg.node);
            var cfgList = levelCfg.children;
            var ddom = null;
            var ddata = null;
            if (cfgList && cfgList.length && pack.DOMList.length) {
                for (var childIndex = 0; childIndex < pack.DOMList.length; childIndex++) {
                    for(var cfgIndex = 0; cfgIndex < cfgList.length; cfgIndex++) {
                        ddom = pack.DOMList[childIndex];
                        ddata = pack.itemList[childIndex];
                        iterateDom(ddom, ddata, cfgList[cfgIndex]);
                    }
                }
            }
            data[childrenKey] = pack.itemList;
        },
        _parseHandleData: function (dom, dataCfg) {
            var result = {};
            var cfg = null;
            var name = null;
            var children = null;
            for (var cfgIndex = 0; cfgIndex < dataCfg.length; cfgIndex++) {
                cfg = dataCfg[cfgIndex];
                children = doc(cfg.selector, dom);
                result[cfg.name] = cfg.handler(children, cfg, doc);
            }
            return result;
        }
    },
    hasContent: function(obj) {
        if (typeof(obj) == 'string') {
            return obj != null && obj != '';
        } else if (obj != null && this.isArray(obj)) {
            return obj.length > 0;
        } else if (typeof(obj) != 'undefined') {
            return obj != null;
        }
        return false;
    },
    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    cleanStr: function(str) {
        return this.hasContent(str)? str.trim(): '';
    },
    linkRequestsToModule: function(routes, module, router, type) {
        routes.forEach(function(rout) {
            router[type? type: 'get'](rout.path, (function() {
                var rt = rout;
                return function(req, res) {
                    try {
                        if (rt.async) {
                            module[rt.method](req, res, function (data) {
                                res.send(api.wrapResponse(data));
                            })
                        } else {
                            res.send(api.wrapResponse(module[rt.method](req, res)));
                        }
                    } catch(e) {
                        res.send(api.wrapResponse(null, e, res));
                    }
                }
            })())
        })
    },
    wrapResponse: function(data, error, response) {
        var reqPath = null;
        if (typeof(error) != 'undefined') {
            reqPath  = response.req.originalUrl;
            console.error('ERROR REQUEST ' + reqPath + ': ' + error);
            return {
                onError: error.message
            }
        } else {
            return {
                onSuccess: data
            }
        }
    },
    /*
     * Recursively merge properties of two objects
     */
    merge: function(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if ( obj2[p].constructor==Object ) {
                    obj1[p] = this.merge(obj1[p], obj2[p]);

                } else {
                    obj1[p] = obj2[p];

                }

            } catch(e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];

            }
        }
        return obj1;
    },
    getCfg: function(configName) {
        return require('./dataConfigs/' + configName);
    },
    getValueFromObjectByPath: function(obj, path) {
        var key;
        var tmp = obj;
        var keys = path.split('.');
        for (var index = 0; index < keys.length; index++) {
            key = keys[index];
            tmp = tmp[key];
            if (typeof(tmp) == 'undefined') {
                tmp = null;
                break;
            }
        }
        return tmp;
    },
    setValueToObjectByPath: function(value, path, dest) {
        var keys = path.split('.');
        var key;
        dest = dest || {};
        for (var index = 0; index < keys.length; index++) {
            key = keys[index];
            if (index == keys.length - 1) {
                dest[key] = value;
            } else {
                dest[key] = dest[key] || {};
                dest = dest[key];
            }
        }
    },
    extractFields: function(object, mappings) {
        var result = {};
        var value;
        var mapping;
        for(var index = 0; index < mappings.length; index++) {
            mapping = mappings[index];
            value = api.getValueFromObjectByPath(object, mapping.from);
            api.setValueToObjectByPath(value, mapping.to, result);
        }
        return result;
    },
    isObject: function(obj) {
        return typeof(obj) === 'object' &&  obj !== null;
    }
};

module.exports = api;