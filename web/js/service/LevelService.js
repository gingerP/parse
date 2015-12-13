define(['./CoreService.js'],
    function(core) {
        var api;
        var urls = {
            save: 'levelConfig/save',
            'delete': 'levelConfig/delete',
            list: 'levelConfig/list',
            getEntity: 'levelConfig/getEntity'
        };

        api = {
            save: function(data, callback) {
                callback();
            },
            'delete': function(id, callback) {
                callback();
            },
            list: function(mappings, callback) {
                callback();
            },
            getEntity: function (id, callback) {
                callback();
            },
            _entity: function() {
                var code = U.getRandomString();
                return {_isNew: true, code: code, path: [], data: [], filter: [], listKey: null};
            }
        };
        return api;
    }
);