var Parent = require('./DBManager');

function ParseConfigDBM() {};

ParseConfigDBM.prototype = Object.create(Parent.prototype);
ParseConfigDBM.prototype.constructor = ParseConfigDBM;

ParseConfigDBM.prototype.getCollectionName = function() {
    return 'parse_configs';
};

ParseConfigDBM.prototype.insert = function(config, callback) {
    this._insert(config, callback);
};

ParseConfigDBM.prototype.getEntity = function(criteria, callback) {
    this._getDoc(criteria, callback);
};

ParseConfigDBM.prototype.getDoc = function(code, callback) {
    this._getDoc({
        code: {
            $eq: code
        }
    }, callback);
};

module.exports = ParseConfigDBM;
