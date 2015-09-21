var handlers = [
    {path: '/api/main', mod: require('./public/javascripts/api/main')}
]

module.exports = {
    init: function(express) {
        handlers.forEach(function(handler) {
            express.use(handler.path, handler.mod);
        })
        return this;
    }
}

