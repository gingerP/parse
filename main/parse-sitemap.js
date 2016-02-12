require('rekuire');
var props = {
	network: {
		https: 18443,
		ssl: {
			active: true,
			path: "/ssl"
		}
	}
};
var Server = require('./common/WebServer').class;
var server = new Server().init(props).start();
var test = require('./schedule/test/SitemapParserTest').instance('item', server);
test.readFromResources('goods-2.xml');
