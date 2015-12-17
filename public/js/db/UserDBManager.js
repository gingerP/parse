var GenericDBManager = require('./GenericDBManager').class;
var manager;

UserDBManager = function() {};
UserDBManager.prototype = Object.create(GenericDBManager.prototype);
UserDBManager.prototype.constructor = UserDBManager;

manager = new UserDBManager();
manager.setCollectionName('users');
module.exports = {
    class: UserDBManager,
    instance: manager
};

