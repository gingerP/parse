var Parent = require('./DBManager');

function ParseDataDBM() {};

ParseDataDBM.prototype = Object.create(Parent.prototype);
ParseDataDBM.prototype.constructor = ParseDataDBM;

ParseDataDBM.prototype.getCollectionName = function() {
    return 'parse_data';
};

ParseDataDBM.prototype.update = function(data, callback) {
    this._update({code: data.code}, data, callback);
};

ParseDataDBM.prototype.getEntity = function(criteria, callback) {
    this._getDoc(criteria, callback);
};

ParseDataDBM.prototype.getDoc = function(code, callback) {
    this._getDoc({
        code: {
            $eq: code
        }
    }, callback);
};

module.exports = ParseDataDBM;
