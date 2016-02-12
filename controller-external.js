var logger = _req('src/js/logger').create('controller-external');
var handlers = [
    {path: '/api/data', mod: require('./src/js/controller/ExternalController')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod.router);
            logger.info('External api point "%s" successfully mapped.', handler.path);
        });
        return this;
    }
};

