define([
    'service/GenericService'
], function(GenericService) {
    'use strict';

    var api;

    function LevelService() {}

    LevelService.prototype = Object.create(GenericService.class.prototype);
    LevelService.prototype.constructor = LevelService;
    LevelService.prototype.getNew = function() {
        var code = U.getRandomString();
        return {_isNew: true, code: code, path: [], data: [], filter: [], listKey: null};
    };
    LevelService.prototype.getUrlPrefix = function() {
        return 'levelConfig';
    };
    api = {
        class: LevelService,
        instance: new LevelService()
    };
    return api;
});