(function() {
    'use strict';

    var configDBManager = require('../../db/ParseConfigDBManager').instance;
    var goodsDBManager = require('../../db/GoodsDBManager').instance;
    var fs = require('fs');
    var itemStep = require('../ScheduleSectionsParseExecutorSteps/ItemStepSM').class;
    var xml2js = require('xml2js');
    var instance;
    var maxIterate = 1000 * 1000;
    var logger = _req('src/js/logger').create('SitemapParser');

    function SitemapParser(configCode, http) {
        this.configCode = configCode;
        this.config;
        this.queue = require('../../common/DistributedLoadingQueue').instance(http);
    }

    SitemapParser.prototype.readFromResources = function () {
        var index = 0;
        var inst = this;
        var argz = arguments;
        this.queue.start(300);
        configDBManager.getByCriteria({code: inst.configCode}).then(function (config) {
            inst.config = config;
            if (!config) {
                logger.warn('Config with code "%s" DIDN\'T found.', inst.configCode);
            }
            while (index < argz.length) {
                inst.loadSitemap(argz[index]).then(function (listItems) {
                    if (listItems && listItems.length) {
                        listItems.every(function (item, index) {
                            if (index < maxIterate) {
                                inst.queue.add(inst.getQueueTask(item, inst.config, inst.configCode)).then(function (data) {
                                    inst.saveItem(data);
                                });
                                return true;
                            }
                            return false;
                        })
                    }
                });
                index++;
            }
        })
    };

    SitemapParser.prototype.saveItem = function (data) {
        goodsDBManager.save(data).then(function () {
        });
    };

    SitemapParser.prototype.loadSitemap = function (file) {
        var parser = new xml2js.Parser();
        console.time('Reading sitemap file "' + file + '"');
        return new Promise(function (resolve) {
            fs.readFile(__dirname + '/../../../../resources/' + file, function (error, data) {
                console.timeEnd('Reading sitemap file "' + file + '"');
                console.time('Parsing sitemap file "' + file + '" to xml');
                parser.parseString(data, function (err, result) {
                    console.timeEnd('Parsing sitemap file "' + file + '" to xml');
                    console.time('Correcting xml');
                    result = result.urlset.url.map(function (item) {
                        return {
                            loc: item.loc[0] || '',
                            changefreq: item.changefreq[0] || '',
                            lastmod: item.lastmod[0] || '',
                            priority: item.priority[0] || ''
                        }
                    });
                    console.timeEnd('Correcting xml');
                    logger.info('Items num: ' + result.length);
                    resolve(result);
                });
            });
        });
    };

    SitemapParser.prototype.getQueueTask = function (item, config, configCode) {
        return {
            url: item.loc,
            lastmod: item.lastmod,
            config: config,
            code: configCode
        }
    };

//TODO
    SitemapParser.prototype.getDeps = function (item) {
        var inst = this;
        return {
            get: function () {
                item.config = inst.config;
                return new Promise(function (resolve) {
                    resolve(item);
                });
            }
        }
    };

    module.exports = {
        class: SitemapParser,
        instance: function (configCode, http) {
            if (!instance) {
                instance = new SitemapParser(configCode, http);
            }
            return instance;
        }
    };
})();