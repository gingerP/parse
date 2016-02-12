var GenericDBManager = require('./GenericDBManager').class;
var manager;

ParseConfigDBManager = function() {};
ParseConfigDBManager.prototype = Object.create(GenericDBManager.prototype);
ParseConfigDBManager.prototype.constructor = ParseConfigDBManager;

manager = new ParseConfigDBManager();
manager.setCollectionName('parse_configs');
module.exports = {
    class: ParseConfigDBManager,
    instance: manager
};
