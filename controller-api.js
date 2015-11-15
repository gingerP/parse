var handlers = [
    {path: '/api/main', mod: require('./public/js/api/main')}
];

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod);
        });
        return this;
    }
};

