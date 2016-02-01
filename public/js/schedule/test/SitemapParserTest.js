var configDBManager= require('../../db/ParseConfigDBManager').instance;
var queue = require('../../common/GenericQueue').instance;
var fs = require('fs');
var itemStep = require('../ScheduleSectionsParseExecutorSteps/ItemStepSM').class;
var xml2js = require('xml2js');
var instance;
var maxIterate = 100;

SitemapParser = function(configCode) {
    this.configCode = configCode;
    this.config;
};

SitemapParser.prototype.readFromResources = function() {
    var index = 0;
    var inst = this;
    var argz = arguments;
    queue.start(300);
    configDBManager.getByCriteria({code: inst.configCode}).then(function (config) {
        inst.config = config;
        while(index < argz.length) {
            inst.loadSitemap(argz[index]).then(function(listItems) {
                if (listItems && listItems.length) {
                    listItems.forEach(function(item, index) {
                        if (index < maxIterate) {
                            queue.add(inst.getQueueTask(item));
                        }
                    })
                }
            });
            index++;
        }
    })
};

//х*******ня
SitemapParser.prototype.loadSitemap = function(file) {
    var parser = new xml2js.Parser();
    console.time('Reading sitemap file "' + file + '"');
    return new Promise(function(resolve) {
        fs.readFile(__dirname + '/../../../../resources/' + file, function(error, data) {
            console.timeEnd('Reading sitemap file "' + file + '"');
            console.time('Parsing sitemap file "' + file + '" to xml');
            parser.parseString(data, function (err, result) {
                console.timeEnd('Parsing sitemap file "' + file + '" to xml');
                console.time('Correcting xml');
                result = result.urlset.url.map(function(item) {
                    return {
                        loc: item.loc[0] || '',
                        changefreq: item.changefreq[0] || '',
                        lastmod: item.lastmod[0] || '',
                        priority: item.priority[0] || ''
                    }
                });
                console.timeEnd('Correcting xml');
                console.log('Items num: ' + result.length);
                resolve(result);
            });
        });
    });
};

SitemapParser.prototype.getQueueTask = function(item) {
    var inst = this;
    return function() {
        return new itemStep().run(inst.getDeps(item));
    };
};

//TODO
SitemapParser.prototype.getDeps = function(item) {
    var inst = this;
    return {
        get: function() {
            item.config = inst.config;
            return new Promise(function(resolve) {
                resolve(item);
            });
        }
    }
};


instance = new SitemapParser('item');
module.exports = {
    class: SitemapParser,
    instance: instance
};