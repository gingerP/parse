var Parent = require('./DBManager');

function ParseConfigDBM() {};

ParseConfigDBM.prototype = Object.create(Parent.prototype);
ParseConfigDBM.prototype.constructor = ParseConfigDBM;

ParseConfigDBM.prototype.getCollectionName = function() {
    return 'parse_configs';
};

ParseConfigDBM.prototype.list = function(callback, mappings) {
    this._list(callback, mappings);
};

ParseConfigDBM.prototype.insert = function(config, callback) {
    this._insert(config, callback);
};

ParseConfigDBM.prototype.update = function(data, callback) {
    this._update({code: { $eq: data.code} }, data, callback);
};

ParseConfigDBM.prototype.getEntity = function(criteria, callback, mappings) {
    this._getDoc(criteria, callback, mappings);
};

ParseConfigDBM.prototype.getDoc = function(code, callback) {
    this._getDoc({
        code: {
            $eq: code
        }
    }, callback);
};

module.exports = ParseConfigDBM;
