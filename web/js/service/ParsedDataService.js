define([
    './GenericService.js'
], function(GenericService) {
    var api;
    ParsedDataService = function() {};
    ParsedDataService.prototype = Object.create(GenericService.class.prototype);
    ParsedDataService.prototype.constructor = ParsedDataService;
    ParsedDataService.prototype.getNew = function() {
        var id = U.getRandomString();
        return {_isNew: true, _id: id, url: null, levels: [], levelConfig: [], listKey: null, parentSel: null, code: null};
    };
    ParsedDataService.prototype.getUrlPrefix = function() {
        return 'parsedData';
    };
    api = {
        class: ParsedDataService,
        instance: new ParsedDataService()
    };
    return api;
});