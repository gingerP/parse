var dependencies = {
    request: 'request',
    cheerio: 'cheerio',
    iconv: 'iconv',
    express: 'express',
    iconvLite: 'iconv-lite',
    htmlToJson: './modules/htmlToJson'
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
        getRef('iconvLite').extendNodeEncodings();
        getRef('request')({
            url: url,
            encoding: encodeFrom
        }, function (error, response, body) {
            var res = null;
            //var translator = new (getRef('iconv'))(encodeFrom, 'utf8');
            if (!error && response.statusCode == 200) {
                console.info("utils.loadDom: " + response.statusCode);
                res = body;
            } else {
                console.warn("utils.loadDom: " + response.statusCode);
            }
            if (typeof(callback) == 'function') {
              //  callback(translator.convert(res).toString());
                callback(res);
            }
        });
    },
    parseHtml: function(string) {
        var htmlParser = getRef('cheerio');
        return htmlParser.load(string);
    },
    extractDataFromHtml: function (dom, cfg) {
        var Parser = getRef('htmlToJson');
        return new Parser().get(dom, cfg);
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
    }
};

module.exports = api;