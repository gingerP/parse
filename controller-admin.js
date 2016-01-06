var handlers = [
    {path: '/api/constructor', mod: require('./public/js/controller/ConstructorController')},
    {path: '/api/schedule', mod: require('./public/js/controller/ScheduleController')},
    {path: '/api/apiConstructor', mod: require('./public/js/controller/ApiConstructorController')},
    {path: '/api/parsedData', mod: require('./public/js/controller/ParsedDataController')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod.router);
            console.log('%s: Api point "%s" successfully mapped.' , Date(Date.now()), handler.path);
        });
        return this;
    }
};

