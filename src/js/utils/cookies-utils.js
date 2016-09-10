'use strict';

var _ = require('lodash');
var cookieExclusionKeys = ['path', 'expires', 'secure', 'max-age', 'domain', 'httponly'];
var api;

function mergeCookies(sourceA, sourceB) {
    _.forEach(sourceB, function (cookieB) {
        var key = api.getCookieKey(cookieB);
        var cookieA;
        if (key) {
            cookieA = _.find(sourceA, key);
            if (cookieA) {
                cookieA[key] = cookieB[key];
            } else {
                sourceA.push(cookieB);
            }
        }
    });
}

function convertCookieListToString(cookiesObjectsList) {
    var result = {};
    _.forEach(cookiesObjectsList, function (cookie) {
        var key = api.getCookieKey(cookie);
        result[key] = cookie[key];
    });
    return api.convertCookieToString(result);
}

function convertCookieToString(cookieObject) {
    var result = '';
    var key;
    var index = 0;
    var length = Object.keys(cookieObject).length;
    for (key in cookieObject) {
        result += key + '=' + cookieObject[key];
        index++;
        if (index < length) {
            result += ';';
        }
    }
    return result;
}

function getCookieKey(cookie) {
    var result;
    var key;
    for (key in cookie) {
        if (cookieExclusionKeys.indexOf(key) < 0) {
            result = key;
            break;
        }
    }
    return key;
}

function getCookieValue(cookie) {
    var value;
    var key = api.getCookieKey(cookie);
    var result;
    if (key) {
        result = {};
        result[key] = cookie[key];
    }
    return result;
}

function parseCookiePairString(pair) {
    var result;
    var keyValue;
    if (pair) {
        keyValue = pair.split('=');
        if (keyValue.length) {
            result = {};
            result.key = keyValue[0].trim();
            result.value = keyValue[1].trim();
        }
    }
    return result;
}

function parseCookieString(cookieString) {
    var pairs;
    var result;
    if (typeof(cookieString) === 'string') {
        pairs = cookieString.split(';');
        result = {};
        _.forEach(pairs, function (pair) {
            var keyValue = api.parseCookiePairString(pair);
            if (keyValue) {
                result[keyValue.key] = keyValue.value;
            }
        });
    }
    return result;
}

function getDefaultCookies() {
    return [
        {'screen': encodeURIComponent('a:2:{s:5:"width";s:4:"1920";s:6:"height";s:4:"1080";}')},
        {'_ym_uid': '1472508148291629932'},
        {'_dc_gtm_UA-261936-1': '1'},
        {'_gat_UA-261936-1': '1'},
        {'_ym_isad': '1'},
        {'_ga': 'GA1.2.1651690747.1472508148'}
    ];
}

api = {
    mergeCookies: mergeCookies,
    convertCookieListToString: convertCookieListToString,
    convertCookieToString: convertCookieToString,
    getCookieKey: getCookieKey,
    getCookieValue: getCookieValue,
    parseCookiePairString: parseCookiePairString,
    parseCookieString: parseCookieString,
    getDefaultCookies: getDefaultCookies
};

module.exports = api;
