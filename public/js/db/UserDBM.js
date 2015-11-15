var Parent = require('./DBManager');
var md5 = require('md5');

function UserDBM() {};

UserDBM.prototype = Object.create(Parent.prototype);
UserDBM.prototype.constructor = UserDBM;

UserDBM.prototype.getCollectionName = function() {
    return 'users';
};

UserDBM.prototype.create = function(name, password, callback) {
    var pass = md5(password);
    var inst = this;
    this.getUser(name, function(user) {
        if (!user) {
            inst._insert({name: name, pass: pass}, callback);
        } else {
            return false;
        }
    });
};

UserDBM.prototype.changePassword = function(name, password, callback) {
    var pass = md5(password);
    this._update({name: name}, {pass: pass}, callback);
};

UserDBM.prototype.doesUserExist = function(name, password, callback) {
    var pass = md5(password);
    this._getDoc({name: name, pass: pass}, function(user) {
        callback(!!user);
    })
};

UserDBM.prototype.getUser = function(name, callback) {
    this._getDoc({name: name}, callback);
};

UserDBM.prototype.getDoc = function(code, callback) {
    this._getDoc({
        code: {
            $eq: code
        }
    }, callback);
};

module.exports = UserDBM;
