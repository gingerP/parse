var GenericDBManager = require('./GenericDBManager').class;
var manager;

ParseDataDBManager = function() {};

ParseDataDBManager.prototype = Object.create(GenericDBManager.prototype);
ParseDataDBManager.prototype.constructor = ParseDataDBManager;

ParseDataDBManager.prototype.getDoc = function(code) {
    this.getByCriteria({code: code});
};

manager = new ParseDataDBManager();
manager.setCollectionName('parse_data');
module.exports = {
    class: ParseDataDBManager,
    instance: manager
};
