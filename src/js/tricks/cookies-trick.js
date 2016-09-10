'use strict';

const urlUtils = require('url');
var cookieUtils = _req('src/js/utils/cookies-utils');
var httpUtils = _req('src/js/utils/http-utils');
var GenericTrick = _req('src/js/tricks/generic-trick');
var REQUEST_COOKIE_KEY = 'cookie';
var RESPONSE_COOKIE_KEY = 'set-cookie';
var _ = require('lodash');

function CookieTrick(cookies) {
    this.cookies = cookies || [];
    this.headers = httpUtils.getDefaultHeaders();
    this.iterationIndex = 0;
    this.updateNumber = 500;
}

CookieTrick.prototype = Object.create(GenericTrick.prototype);
CookieTrick.prototype.constructor = CookieTrick;

CookieTrick.prototype.setUpdateNumber = function (number) {
    this.updateNumber = number;
    return this;
};

CookieTrick.prototype.setAsStringsList = function (cookiesStrings) {
    var cookiesObjectsList = _.map(cookiesStrings, cookieUtils.parseCookieString);
    this.set(cookiesObjectsList);
    return this;
};

CookieTrick.prototype.set = function (cookies) {
    cookieUtils.mergeCookies(this.cookies, cookies);
    return this;
};

CookieTrick.prototype.get = function () {
    return this.cookies;
};

CookieTrick.prototype.getAsString = function () {
    return cookieUtils.convertCookieListToString(this.cookies);
};

CookieTrick.prototype.handleRequest = function (request) {
    this.iterationIndex++;
    if (this.updateNumber === this.iterationIndex) {
        this.iterationIndex = 0;
        this.headers = httpUtils.getDefaultHeaders();
    }
    request.headers = _.cloneDeep(this.headers);
    request.headers.host = urlUtils.parse(request.url).host;
    request.headers[REQUEST_COOKIE_KEY] = this.getAsString();
    return this;
};

CookieTrick.prototype.handleResponse = function (response) {
    if (response) {
        this.setAsStringsList(response.headers[RESPONSE_COOKIE_KEY]);
    }
    return this;
};

module.exports = CookieTrick;

