var props = {
    network: {
        https: 18443,
        ssl: {
            active: true
        }
    }
};
var Server = require('./public/js/common/WebServer').class;
var server = new Server().init(props).start();
var test = require('./public/js/schedule/test/SitemapParserTest').instance('item', server);
test.readFromResources('goods-2.xml');