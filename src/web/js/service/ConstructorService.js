define([
    './GenericService.js'
], function(GenericService) {
    var api;
    ConstructorService = function() {};
    ConstructorService.prototype = Object.create(GenericService.class.prototype);
    ConstructorService.prototype.constructor = ConstructorService;
    ConstructorService.prototype.test = function(id, callback) {
        this._load(this.getUrl('test'), callback, {id: id});
    };
    ConstructorService.prototype.getNew = function() {
        var id = U.getRandomString();
        return {_isNew: true, _id: id, url: null, levels: [], levelConfig: [], listKey: null, parentSel: null, code: null};
    };
    ConstructorService.prototype.getUrlPrefix = function() {
        return 'constructor';
    };
    api = {
        class: ConstructorService,
        instance: new ConstructorService()
    };
    return api;
});