var handlers = [
    {path: '/api/data', mod: require('./public/js/controller/ExternalController')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod.router);
            console.log('%s: External api point "%s" successfully mapped.' , Date(Date.now()), handler.path);
        });
        return this;
    }
};

