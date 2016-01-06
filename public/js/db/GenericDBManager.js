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
var Observable = require('../common/Observable').class;

GenericDBManager = function() {};

GenericDBManager.prototype = Object.create(Observable.prototype);
GenericDBManager.prototype.constructor = GenericDBManager;

GenericDBManager.prototype.init = function() {
    this.connection = null;
};
GenericDBManager.prototype.setCollectionName = function(collectionName) {
    this.collectionName = collectionName;
};
GenericDBManager.prototype.getCollectionName = function() {
    return this.collectionName;
};
GenericDBManager.prototype.exec = function(callback) {
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
GenericDBManager.prototype.update = function() {

};
GenericDBManager.prototype._getDoc = function(criteria, callback, mappings) {
    var inst = this;
    var collName = this.getCollectionName();
    if (typeof(criteria) == 'number' || typeof(criteria) == 'string') {
        criteria = {_id: new this._getObjectId(criteria)};
    }
    validate.collectionName(collName);
    validate.criteria(criteria);
    this.exec(function(db) {
        db.collection(inst.collectionName).find(criteria, function(error, cursor) {
            cursor.next(function(error, doc) {
                if (error) {
                    console.log('%s: An ERROR has occurred while extracted document from "%s".', Date(Date.now()), inst.getCollectionName());
                    callback({});
                } else {
                    console.log('%s: Document {_id: "%s"} was successfully extracted from "%s".', Date(Date.now()), doc? doc._id: null, inst.getCollectionName());
                    if (mappings) {
                        callback(utils.extractFields(doc, mappings));
                    } else {
                        callback(doc);
                    }
                }
            });
        });
    });
};
GenericDBManager.prototype._save = function(doc, callback, criteria, mappings) {
    var id = doc._id;
    delete doc._id;
    if (criteria) {
        this._correctCriteria(criteria);
        this._update(criteria, doc, callback, mappings);
    } else if (utils.hasContent(id)) {
        this._update({_id: this._getObjectId(id)}, doc, callback, mappings);
    } else {
        this._insert(doc, callback, mappings);
    }
};
GenericDBManager.prototype._saveEntities = function(doc, callback) {
    console.log('_saveEntities not implemented');
};
GenericDBManager.prototype._update = function(criteria, doc, callback, mappings, upsert) {
    var inst = this;
    upsert = utils.hasContent(upsert)? !!upsert: true;
    validate.collectionName(this.collectionName);
    inst._correctCriteria(criteria);
    this.exec(function(db) {
        var id = doc._id;
        delete doc._id;
        if (!mappings) {
            db.collection(inst.collectionName).updateOne(criteria || {_id: this._getObjectId(id)}, doc, {
                upsert: upsert,
                raw: true
            }, function (error, result) {
                if (error) {
                    console.log('%s: An ERROR has occurred while updating document in "%s".', Date(Date.now()), inst.getCollectionName());
                    throw new Error(error);
                } else if (typeof(callback) == 'function') {
                    console.log('%s: Document was successfully updated in "%s".', Date(Date.now()), inst.getCollectionName());
                    callback(result.upsertedId ? result.upsertedId._id : null);
                }
            });
        } else {
            db.collection(inst.collectionName).find(criteria, function(error, cursor) {
                cursor.next(function (error, cursorDoc) {
                    if (error) {
                        console.log('%s: An ERROR has occurred while getting document from "%s" to update.', Date(Date.now()), inst.getCollectionName());
                        callback({});
                    } else {
                        console.log('%s: Document {_id: "%s"} was successfully extracted from "%s".', Date(Date.now()), doc ? doc._id : null, inst.getCollectionName());
                        inst._mergeTo(cursorDoc, doc, mappings);
                        inst._update({_id: cursorDoc._id}, cursorDoc, function() {
                            callback(true);
                        });
                    }
                    return false;
                });
            });
        }
    });
};
GenericDBManager.prototype._insert = function(doc, callback) {
    var inst = this;
    var collName = this.getCollectionName();
    validate.collectionName(collName);
    this.exec(function(db) {
        db.collection(collName).insertOne(doc, function(error, result) {
            var id;
            if (error) {
                console.log('%s: An ERROR has occurred while inserting document in "%s".', Date(Date.now()), inst.getCollectionName());
                throw new Exception(error);
            } else if (typeof(callback) == 'function') {
                id = doc._id || result.insertedId;
                console.log('%s: Document was successfully inserted into "%s".', Date(Date.now()), inst.getCollectionName());
                callback(id);
            }
        });
    });
};
GenericDBManager.prototype._delete = function(criteria, callback) {
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
GenericDBManager.prototype._list = function(callback, mappings) {
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
                });
            } else if (typeof(callback) == 'function') {
                console.log('%s: List(num: %s) of documents was successfully extracted from "%s".', Date(Date.now()), index, inst.getCollectionName());
                callback(res);
            }
        });
    })
};
GenericDBManager.prototype._mergeTo = function(dest, src, mappings) {
    if (mappings && mappings.length) {
        mappings.forEach(function(mappingItem) {
            var srcValue = utils.getValueFromObjectByPath(src, mappingItem.input || mappingItem.property);
            utils.setValueToObjectByPath(dest, mappingItem.property, srcValue);
        });
    }
    return dest;
};
/**************************/
GenericDBManager.prototype.save = function(doc, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst._save(doc, function(data) {
            inst.propertyChange('save', [data, doc, mappings]);
            resolve(data);
        }, null, mappings);
    });
};
GenericDBManager.prototype.saveByCriteria = function(doc, criteria, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst._save(doc, function(data) {
            inst.propertyChange('saveByCriteria', [data, doc, criteria, mappings]);
            resolve(data);
        }, criteria, mappings);
    });
};
GenericDBManager.prototype.get = function(id, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var criteria = {_id: inst._getObjectId(id)};
        inst._getDoc(criteria, function(entities) {
            inst.propertyChange('get', [entities, id, mappings]);
            resolve(entities);
        }, mappings);
    });
};
GenericDBManager.prototype.getByCriteria = function(criteria, mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst._getDoc(criteria, function(entities) {
            inst.propertyChange('getByCriteria', [entities, criteria, mappings]);
            resolve(entities);
        }, mappings);
    });
};
GenericDBManager.prototype.remove = function(id) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        var criteria = {_id: inst._getObjectId(id)};
        inst._delete(criteria, function(data) {
            inst.propertyChange('remove', [data, id]);
            resolve(data);
        });
    });
};
GenericDBManager.prototype.list = function(mappings) {
    var inst = this;
    return new Promise(function(resolve, reject) {
        inst._list(function(entities) {
            inst.propertyChange('list', [{}/*filters*/, mappings]);
            resolve(entities);
        }, mappings);
    })
};
GenericDBManager.prototype._getDBUrl = function() {
    var url = 'mongodb://'
        + cfg.user + ':'
        + cfg.pass + '@'
        + cfg.host + ':'
        + cfg.port + '/'
        + cfg.dbName;
    return url;
};

GenericDBManager.prototype._getObjectId = function(id) {
    if (id instanceof bongo.ObjectID) {
        return id;
    } else {
        return new bongo.ObjectId(id);
    }
};

GenericDBManager.prototype._correctCriteria = function(criteria) {
    if (!criteria) {
        return;
    }
    if (criteria.hasOwnProperty('_id')) {
        criteria._id = this._getObjectId(criteria._id);
    }
    return criteria;
};

module.exports = {
    class: GenericDBManager
};