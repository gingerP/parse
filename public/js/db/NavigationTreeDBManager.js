var GenericDBManager = require('./GenericDBManager').class;
var manager;

NavigationTreeDBManager = function() {};
NavigationTreeDBManager.prototype = Object.create(GenericDBManager.prototype);
NavigationTreeDBManager.prototype.constructor = NavigationTreeDBManager;

manager = new NavigationTreeDBManager();
manager.setCollectionName('navigation_tree');
module.exports = {
    class: NavigationTreeDBManager,
    instance: manager
};
