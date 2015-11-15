define(['./CoreService.js'],
    function(core) {
        var api;
        var urls = {
            save: 'constructor/save',
            delete: 'constructor/delete',
            list: 'constructor/list',
            getEntity: 'constructor/getEntity'
        };

        api = {
            save: function(data, callback) {
                core.load(urls.save, callback, data);
            },
            delete: function(id, callback) {
                core.load(urls.delete, callback, {id: id});
            },
            list: function(mappings, callback) {
                core.load(urls.list, callback, {mappings: mappings});
            },
            getEntity: function (id, callback) {
                core.load(urls.getEntity, callback, {id: id});
            }
        };
        return api;
    }
);