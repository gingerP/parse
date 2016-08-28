(function () {
    global._req = require('app-root-path').require;
    var request = require('request');
    var urlList = require('../resources/goods-1');
    var logger = _req('src/js/logger').create('Test');
    var utils = _req('src/js/utils/parse-utils');
    var index = 0;
    var LIMIT = 100000;
    var failed = 0;
    logger.setLevel('INFO');

    var cycle = setInterval(function () {
        var url = urlList[index];
        var indexx = index;
        utils
            .loadDom(url)
            .then(
                function (result) {
                    logger.info('(Failed: %s) %s %s', failed, indexx, url);
                },
                function (url) {
                    failed++;
                    logger.info('%s %s', indexx, url);
                });
        index++;
        if (index > LIMIT) {
            clearInterval(cycle);
        }
    }, 100);
})();
