var GenericDBManager = require('./GenericDBManager').class;
var manager;

ApiConstructorDBManager = function() {};
ApiConstructorDBManager.prototype = Object.create(GenericDBManager.prototype);
ApiConstructorDBManager.prototype.constructor = ApiConstructorDBManager;

manager = new ApiConstructorDBManager();
manager.setCollectionName('api_constructors');
module.exports = {
    class: ApiConstructorDBManager,
    instance: manager
};
