var appRoot = require('app-root-path');
var cfg = require(appRoot + '/prop').db;
var utils = require(appRoot + '/public/js/utils.js');
var bongo = require('mongodb');
var assert = require('assert');
var messages = {
    notEmpty: 'Collection name cannot be empty!',
    criteriaNotEmpty: 'Criteria cannot be empty!'
};
var validate = {
    collectionName: function(collName) {
        assert.notEqual(collName, null, messages.notEmpty);
        assert.notEqual(collName, '', messages.notEmpty);
        assert.notEqual(collName, undefined, messages.notEmpty);
    },
    criteria: function(criteria) {
        assert.notEqual(criteria, null, messages.criteriaNotEmpty);
        assert.notEqual(criteria, undefined, messages.criteriaNotEmpty);
    }
};
function DBManager() {
};

DBManager.prototype.init = function() {
    this.connection = null;
};

/**
 * need to override in nested class
 * @returns {string}
 */
DBManager.prototype.getCollectionName = function() {
    return '';
};

DBManager.prototype.exec = function(callback) {
    var inst = this;
    if (!this.connection) {
        bongo.connect(this._getDBUrl(), function (error, db) {
            assert.equal(null, error);
            inst.connection = db;
            callback(inst.connection, error);
        });
    } else {
        callback(this.connection);
    }
};

DBManager.prototype.update = function() {

};

DBManager.prototype._getDoc = function(criteria, callback, mappings) {
    var inst = this;
    var collName = this.getCollectionName();
    if (typeof(criteria) == 'number' || typeof(criteria) == 'string') {
        criteria = {_id: new this._getObjectId(criteria)};
    }
    validate.collectionName(collName);
    validate.criteria(criteria);
    this.exec(function(db) {
        db.collection(collName).find(criteria, function(error, cursor) {
            cursor.next(function(error, doc) {
                if (error) {
                    console.log('%s: An ERROR has occurred while extracted document from "%s".', Date(Date.now()), inst.getCollectionName());
                    callback({});
                } else {
                    console.log('%s: Document {_id: "%s"} was successfully extracted from "%s".', Date(Date.now()), doc._id, inst.getCollectionName());
                    if (mappings) {
                        callback(utils.extractFields(doc, mappings));
                    } else {
                        callback(doc);
                    }
                }
            })
        })
    });
};

DBManager.prototype._save = function(doc, callback, criteria) {
    if (doc._id) {
        this._update(criteria, doc, callback);
    } else {
        this._insert(doc, callback);
    }
};

DBManager.prototype._saveEntities = function(doc, callback) {
    console.log('_saveEntities not implemented');
};

DBManager.prototype._update = function(criteria, doc, callback) {
    var inst = this;
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        var id = doc._id;
        delete doc._id;
        db.collection(collName).updateOne(criteria || {_id: id}, doc, { upsert: true, raw: true}, function(error, result) {
            if (error) {
                console.log('%s: An ERROR has occurred while updating document in "%s".', Date(Date.now()), inst.getCollectionName());
                throw new Exception(error);
            } else if (typeof(callback) == 'function') {
                console.log('%s: Document was successfully updated in "%s".', Date(Date.now()), inst.getCollectionName());
                callback(result.upsertedId? result.upsertedId._id: null);
            }
        });
    })
};

DBManager.prototype._insert = function(doc, callback) {
    var inst = this;
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        db.collection(collName).insertOne(doc, function(error, result) {
            if (error) {
                console.log('%s: An ERROR has occurred while inserting document in "%s".', Date(Date.now()), inst.getCollectionName());
                throw new Exception(error);
            } else if (typeof(callback) == 'function') {
                console.log('%s: Document was successfully inserted into "%s".', Date(Date.now()), inst.getCollectionName());
                callback(result);
            }
        });
    })
};

DBManager.prototype._delete = function(criteria, callback) {
    var inst = this;
    var collName = this.getCollectionName();
    if (typeof(criteria) == 'number' || typeof(criteria) == 'string') {
        criteria = {_id: new this._getObjectId(criteria)};
    }
    validate.collectionName(collName);
    this.exec(function(db) {
        db.collection(collName).removeOne(criteria, function(error, result) {
            if (error) {
                console.log('%s: An ERROR has occurred while deleting document in "%s".', Date(Date.now()), inst.getCollectionName());
                throw new Exception(error);
            } else if (typeof(callback) == 'function') {
                console.log('%s: Document was successfully deleted in "%s".', Date(Date.now()), inst.getCollectionName());
                callback(result);
            }
        });
    })
};

DBManager.prototype._list = function(callback, mappings) {
    var inst = this;
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        var cursor = db.collection(collName).find({});
        var index = 0;
        var res = [];
        cursor.count({}, function(error, count) {
            if (count) {
                cursor.forEach(function (doc) {
                    index++;
                    if (mappings) {
                        res.push(utils.extractFields(doc, mappings));
                    } else {
                        res.push(doc);
                    }
                    if (index == count && typeof(callback) == 'function') {
                        console.log('%s: List(num: %s) of documents was successfully extracted from "%s".', Date(Date.now()), index, inst.getCollectionName());
                        callback(res);
                    }
                })
            } else if (typeof(callback) == 'function') {
                console.log('%s: List(num: %s) of documents was successfully extracted from "%s".', Date(Date.now()), index, inst.getCollectionName());
                callback(res);
            }
        });
    })
};

DBManager.prototype._getDBUrl = function() {
    var url= 'mongodb://'
        + cfg.user + ':'
        + cfg.pass + '@'
        + cfg.host + ':'
        + cfg.port + '/'
        + cfg.dbName;
    return url;
};

DBManager.prototype._getObjectId = function(id) {
    return new bongo.ObjectId(id);
};

module.exports = DBManager;