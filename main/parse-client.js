require('rekuire');
var Client = require('../src/js/modules/DistributedParserClient').class;
var client = new Client('wss://localhost:18443/parser_client').initClient().makeAutoReconnect().connect();