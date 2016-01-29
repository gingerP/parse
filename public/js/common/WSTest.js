var wsServer;
var instance;
WSTest = function() {};

WSTest.prototype.run = function() {
    setInterval(function() {
        wsServer.propertyChange('ws-test', "WS TREST!!");
    }, 1000);
};


instance = new WSTest();
module.exports = {
    run: function(ws) {
        wsServer = ws;
        instance.run();
    }
};