'use strict';

var request = require('request');
var agents = require('./http-agents');
var _ = require('lodash');

var api = {
    getDefaultHeaders: function () {
        return {
            'Transfer-Encoding': 'chunked',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'en-US,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': api.getRandomAgent(),
            'Host': 'oz.by'
        }
    },
    getRandomAgent: function () {
        var index = Math.floor(agents.length * Math.random());
        return agents[index];
    },
    loadDom: function (url, headers) {
        return new Promise(function (resolve, reject) {
            if (typeof(url) === 'string' && (url.indexOf('http://') != 0 && url.indexOf('https://') != 0)) {
                url = 'http://' + url;
            }
            request.defaults({pool: {maxSockets: Infinity}, timeout: 100 * 1000})({
                url: url,
                gzip: true,
                headers: headers
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve({
                        response: response,
                        body: body
                    }, 1);
                } else {
                    reject({
                        error: error,
                        statusCode: response ? response.statusCode : '-1'
                    });
                }
            });
        });
    }
};

module.exports = api;
