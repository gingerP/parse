module.exports = (function() {
    var api = null;
    var modules = [];
    var cache = [];

    function validate(newModules) {
        return newModules.filter(function(module) {
            return modules.indexOf(module) < 0;
        })
    };

    api = {
        init: function () {
            var _modules = Array.prototype.slice.call(arguments);
            _modules = validate(_modules);
            modules = modules.concat(_modules);
            return api;
        },
        start: function() {
            modules.forEach(function (module) {
                setTimeout(function() {
                    module._cache(function(data) {
                        cache = cache.concat(data);
                    });
                }, 0)
            });
            return api;
        },
        getCache: function() {
            return cache;
        }
    };
    return api;
})();