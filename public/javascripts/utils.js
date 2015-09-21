var dependencies = {
    request: '../../../request',
    xmldom: 'xmldom',
    cheerio: 'cheerio',
    iconv: 'iconv'
};
function getRef(ref) {
    if (typeof(dependencies[ref]) == "string") {
        dependencies[ref] = require(ref);
    }
    return dependencies[ref];
}

module.exports = {
    loadDom: function(url, callback, encodeFrom) {
        getRef('request')({
            url: url,
            request: null
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
    extractDataFromHtml: function(dom, cfg, mainSelector, childrenKey) {
        var extract = function(dom, level) {
            var objects = doc(level.relSelector, dom);
            var res = [];
            for(var index = 0; index < objects.length; index++) {
                res.push(handleData(objects[index], level.data));
            }
            return {
                DOMList: objects || [],
                itemList: res,
            };
        };
        var handleData = function (dom, dataCfg) {
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
        };
        var iterateDom = function (dom, data, levelCfg) {
            var pack = extract(dom, levelCfg.node);
            var cfgList = levelCfg.children;
            var ddom = null;
            var ddata = null;
            if (cfgList && cfgList.length && pack.DOMList.length) {
                for(var cfgIndex = 0; cfgIndex < cfgList.length; cfgIndex++) {
                    for (var childIndex = 0; childIndex < pack.length; childIndex++) {
                        ddom = pack.DOMList[childIndex];
                        ddata = pack.itemList[childIndex];
                        iterateDom(ddom, ddata, cfgList[cfgIndex]);
                    }
                }
            }
            data[childrenKey] = pack.itemList;
        };
        var doc = this.parseHtml(dom);
        var html = doc(mainSelector, dom);
        var result = {};
        if (html.length) {
            iterateDom(html[0], result, cfg);
        }
        return result;
    }
};