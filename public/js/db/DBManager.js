var cfg = require('../../db');
var utils = require('../utils.js');
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
    console.time('connect');
    var inst = this;
    if (!this.connection) {
        bongo.connect(this._getDBUrl(), function (error, db) {
            console.timeEnd('connect');
            assert.equal(null, error);
            console.log('NEW connection is established!');
            inst.connection = db;
            callback(inst.connection, error);
        });
    } else {
        console.log('use CURRENT connection!');
        callback(this.connection);
    }
};

DBManager.prototype.update = function() {

};

DBManager.prototype._getDoc = function(criteria, callback, mappings) {
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
                    console.log("DBManager.prototype._getDoc" + error);
                    callback({});
                } else {
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
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        var id = doc._id;
        delete doc._id;
        db.collection(collName).updateOne(criteria || {_id: id}, doc, { upsert: true, raw: true}, function(error, result) {
            if (error) {
                throw new Exception(error);
            } else if (typeof(callback) == 'function') {
                callback(result.upsertedId? result.upsertedId._id: null);
            }
        });
    })
};

DBManager.prototype._insert = function(doc, callback) {
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        db.collection(collName).insertOne(doc);
        if (typeof(callback) == 'function') {
            callback();
        }
    })
};

DBManager.prototype._list = function(callback, mappings) {
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        var cursor = db.collection(collName).find({});
        var index = 0;
        var res = [];
        var cursorNum = cursor.count({}, function(error, count) {
            cursor.forEach(function(doc) {
                index++;
                if (mappings) {
                    res.push(utils.extractFields(doc, mappings));
                } else {
                    res.push(doc);
                }
                if (index == count && typeof(callback) == 'function') {
                    callback(res);
                }
            })
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
    var sysUrl = null;
/*    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        sysUrl = 'mongodb://' +
            process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
    }
    return sysUrl;*/
    return url;
};

DBManager.prototype._getObjectId = function(id) {
    return new bongo.ObjectId(id);
};

module.exports = DBManager;