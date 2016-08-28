(function () {
    'use strict';

    var request = require('request');
    var agents = require('./http-agents');
    var api = {
        getRandomAgent: function () {
            var index = Math.floor(agents.length * Math.random());
            return agents[index];
        },
        loadDom: function (url) {
            return new Promise(function (resolve, reject) {
                if (typeof(url) === 'string' && (url.indexOf('http://') != 0 && url.indexOf('https://') != 0)) {
                    url = 'http://' + url;
                }
                request.defaults({pool: {maxSockets: Infinity}, timeout: 100 * 1000})({
                    url: url,
                    gzip: true,
                    headers: {
                        'Transfer-Encoding': 'chunked',
                        'User-Agent': api.getRandomAgent(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    }
                }, function (error, response, body) {
                    var res = null;
                    if (!error && response.statusCode == 200) {
                        res = body;
                        resolve(res);
                    } else {
                        reject({
                            error: error,
                            statusCode: response.statusCode
                        });
                    }
                });
            });
        }
    };

    module.exports = api;
})();