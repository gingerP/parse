var handlers = [
    {path: '/api/constructor', mod: require('./public/js/controller/ConstructorController')},
    {path: '/api/schedule', mod: require('./public/js/controller/ScheduleController')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod.router);
            console.log('%s: Request "%s" successfully mapped.' , Date(Date.now()), handler.path);
        });
        return this;
    }
};

