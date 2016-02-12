var logger = _req('src/js/logger').create('controller-admin');
var handlers = [
    {path: '/api/constructor', mod: require('./src/js/controller/ConstructorController')},
    {path: '/api/schedule', mod: require('./src/js/controller/ScheduleController')},
    {path: '/api/apiConstructor', mod: require('./src/js/controller/ApiConstructorController')},
    {path: '/api/parsedData', mod: require('./src/js/controller/ParsedDataController')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod.router);
            logger.info('Api point "%s" successfully mapped.', handler.path);
        });
        return this;
    }
};

