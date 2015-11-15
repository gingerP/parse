var handlers = [
    {path: '/api/constructor', mod: require('./public/js/service/ConstructorService')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod);
        });
        return this;
    }
};

