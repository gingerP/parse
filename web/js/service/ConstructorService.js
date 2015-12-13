define(['./CoreService.js'],
    function(core) {
        var api;
        var urls = {
            save: 'constructor/save',
            'delete': 'constructor/delete',
            list: 'constructor/list',
            getEntity: 'constructor/getEntity',
            test: 'constructor/test'
        };

        api = {
            save: function(data, callback) {
                core.load(urls.save, callback, data);
            },
            'delete': function(id, callback) {
                core.load(urls['delete'], callback, {id: id});
            },
            list: function(mappings, callback) {
                core.load(urls.list, callback, {mappings: mappings});
            },
            getEntity: function (id, callback) {
                core.load(urls.getEntity, callback, {id: id});
            },
            test: function (id, handlers) {
                core.load(urls.test, handlers, {id: id});
            },
            _entity: function() {
                var id = U.getRandomString();
                return {_isNew: true, _id: id, url: null, levels: [], levelConfig: [], listKey: null, parentSel: null, code: null};
            }
        };
        return api;
    }
);