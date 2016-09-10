global._req = require('app-root-path').require;
var props = {
	network: {
		https: 18443,
		ssl: {
			active: false,
			path: "/ssl"
		}
	}
};
var Server = _req('src/js/common/WebServer').class;
var server = new Server().init(props).start();
var test = _req('src/js/schedule/test/SitemapParserTest').instance('item', server);
test.readFromResources('goods-1.xml', 'goods-2.xml', 'goods-3.xml', 'goods-4.xml', 'goods-5.xml', 'goods-6.xml');
