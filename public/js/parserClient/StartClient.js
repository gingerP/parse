var Client = require('./../modules/DistributedParserClient').class;
var client = new Client('wss://localhost:8443/parser_client').initClient().makeAutoReconnect().connect();