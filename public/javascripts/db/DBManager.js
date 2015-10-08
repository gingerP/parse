var cfg = require('../../openshift');
var bongo = require('mongodb');
var assert = require('assert');
var messages = {
    notEmpty: 'Collection name cannot be empty!',
    criteriaNotEmpty: 'Criteria cannot be empty!'
}
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
}
function DBManager() {};

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

DBManager.prototype._getDoc = function(criteria, callback) {
    var inst = this;
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    validate.criteria(criteria);
    console.time('_getDoc');
    this.exec(function(db) {
        console.timeEnd('_getDoc');
        console.time('_getDoc_extract');
        var cursor = db.collection(collName).find(criteria, function(error, cursor) {
            cursor.next(function(error, doc) {
                if (error) {
                    console.log(error);
                    callback({})
                } else if (typeof(callback) == 'function') {
                    console.timeEnd('_getDoc_extract');
                    callback(doc);
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
        db.collection(collName).updateOne(criteria || {_id: doc._id}, doc, { upsert: true });
        if (typeof(callback) == 'function') {
            callback();
        }
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

DBManager.prototype._list = function(callback) {
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        var cursor = db.collection(collName).find({});
        var index = 0;
        var res = [];
        var cursorNum = cursor.count({}, function(error, count) {
            cursor.forEach(function(doc) {
                index++;
                res.push(doc);
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
    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        sysUrl = 'mongodb://' +
            process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
    }
    console.log('sysUrl: ' + sysUrl);
    console.log('url: ' + url);
    return sysUrl;
};

module.exports = DBManager;