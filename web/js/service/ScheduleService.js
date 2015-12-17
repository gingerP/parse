define(['./CoreService.js'],
    function(core) {
        var api;
        var urls = {
            'save': 'schedule/save',
            'delete': 'schedule/delete',
            'list': 'schedule/list',
            'get': 'schedule/get',
            'test': 'schedule/test'
        };

        api = {
            'save': function(data, callback) {
                core.load(urls.save, callback, data);
            },
            'delete': function(id, callback) {
                core.load(urls['delete'], callback, {id: id});
            },
            'list': function(mappings, callback) {
                core.load(urls.list, callback, {mappings: mappings});
            },
            'get': function (id, callback) {
                core.load(urls.get, callback, {id: id});
            },
            'test': function (id, handlers) {
                core.load(urls.test, handlers, {id: id});
            },
            '_entity': function() {
                var id = U.getRandomString();
                return {_isNew: true, _id: id, code: null, config: '', cron: null, status: null, progress: null};
            }
        };
        return api;
    }
);