define([
    'service/GenericService'
], function(GenericService) {
    'use strict';

    var api;

    function ApiConstructorService() {}

    ApiConstructorService.prototype = Object.create(GenericService.class.prototype);
    ApiConstructorService.prototype.constructor = ApiConstructorService;
    ApiConstructorService.prototype.test = function(id, callback) {
        this._load(this.getUrl('test'), callback, {id: id});
    };
    ApiConstructorService.prototype.getNew = function() {
        var id = U.getRandomString();
        return {_isNew: true, _id: id, code: null, url: null, active: 0, config: null};
    };
    ApiConstructorService.prototype.getUrlPrefix = function() {
        return 'apiConstructor';
    };
    api = {
        class: ApiConstructorService,
        instance: new ApiConstructorService()
    };
    return api;
});