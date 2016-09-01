global._req = require('app-root-path').require;

(function () {
    'use strict';

    var request = require('request');
    var _ = require('lodash');
    var cookieParser = require('cookie-parser');
    var urlList = require('../resources/goods-1');
    var logger = _req('src/js/logger').create('Test');
    var httpUtils = _req('src/js/utils/http-utils');
    var cookieUtils = _req('src/js/utils/cookies-utils');
    var CookieTrick = _req('src/js/tricks/cookies-trick');
    var cookieTrick = new CookieTrick(cookieUtils.getDefaultCookies());
    var index = 0;
    var LIMIT = 100000;
    var failed = 0;
    var headers = parseUtils.getDefaultHeaders();
    headers.Cookie = cookieTrick.getAsString();

    function getErrorMessage(error) {
        return error && error.message ? error.message : error;
    }

    logger.setLevel('INFO');

    var cycle = setInterval(function () {
        var url = urlList[index];
        var indexx = index;
        headers.Cookie = cookieTrick.getAsString();
        httpUtils
            .loadDom(url, headers)
            .then(
                function (result) {
                    cookieTrick.setAsStringsList(result.response.headers['set-cookie']);
                    logger.info('Failed/All: %s/%s, Status code: %s, Url: %s', failed, indexx, result.response.statusCode, url);
                },
                function (result) {
                    failed++;
                    logger.error('Failed/All: %s/%s, Status code: %s, Url: %s, Error: %s', failed, indexx, result.statusCode, url, getErrorMessage(result.error));
                });
        index++;
        if (index > LIMIT) {
            clearInterval(cycle);
        }
    }, 300);
})();
