var GenericDBManager = require('./GenericDBManager').class;
var manager;

ItemDBManager = function() {};
ItemDBManager.prototype = Object.create(GenericDBManager.prototype);
ItemDBManager.prototype.constructor = ItemDBManager;

manager = new ItemDBManager();
manager.setCollectionName('navigation_tree');
module.exports = {
    class: ItemDBManager,
    instance: manager
};
