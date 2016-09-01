global._req = require('app-root-path').require;
var Client = require('../src/js/modules/DistributedParserClient').class;
var CookieTrick = _req('src/js/tricks/cookies-trick');
var cookieUtils = _req('src/js/utils/cookies-utils');
var cookieTrick = new CookieTrick().setUpdateNumber(500);
var client = new Client('ws://127.0.0.1:8080/parser_client');

_req('src/js/utils').initMemoryTalking();

cookieTrick.set(cookieUtils.getDefaultCookies());
client.initClient().makeAutoReconnect().addTrick(cookieTrick).connect();
