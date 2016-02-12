var handlers = [
    {path: '/api/main', mod: require('./src/js/api/main')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod);
        });
        return this;
    }
};

