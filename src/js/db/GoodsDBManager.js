var GenericDBManager = require('./GenericDBManager').class;
var manager;

GoodsDBManager = function() {};
GoodsDBManager.prototype = Object.create(GenericDBManager.prototype);
GoodsDBManager.prototype.constructor = GoodsDBManager;

manager = new GoodsDBManager();
manager.setCollectionName('goods');
module.exports = {
    class: GoodsDBManager,
    instance: manager
};
