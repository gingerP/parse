global._req = require('app-root-path').require;
var Client = require('../src/js/modules/DistributedParserClient').class;
var client = new Client('ws://127.0.0.1:8080/parser_client').initClient().makeAutoReconnect().connect();