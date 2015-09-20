var handlers = [
    {path: '/api/catalog', mod: require('./public/javascripts/api/catalog')}
]

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod);
        })
        return this;
    }
}

