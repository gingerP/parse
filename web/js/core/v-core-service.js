function DataManager(service, cfg) {
    this.cfg = {
        idField: '_id'
    };
    $.extend(true, this.cfg, cfg || {});
    this.service = service;
    this.asPromise = false;
}

DataManager.prototype.get = function(id, callback, mappings) {
    this.service.get(id, callback, mappings);
};

DataManager.prototype.save = function(data, callback) {
    this.service.save(data, callback);
};

DataManager.prototype.list = function(callback, mappings) {
    this.service.list(callback, mappings);
};

DataManager.prototype.remove = function(id, callback) {
    if (U.hasContent(id)) {
        this.service.remove(id, callback);
    } else if (typeof(callback) === 'function') {
        callback();
    }
};

DataManager.prototype.prepare = function(entity) {
    var keys;
    var inst = this;
    if (Array.isArray(entity)) {
        $.each(entity, function(i, value) {
            inst.prepare(value);
        })
    } else {
        keys = Object.keys(entity);
        if (entity._isNew) {
            delete entity[this.cfg.idField];
        }
        $.each(keys, function(i, key) {
            if (key.indexOf('_') == 0 && key != inst.cfg.idField) {
                delete entity[key];
            } else if (U.isObject(entity[key])) {
                inst.prepare(entity[key]);
            }
        })
    }
};

DataManager.prototype.createNewEntity = function() {
    return this.service.getNew();
};

DataManager.prototype.getId = function(entity) {
    return entity[this.cfg.idField];
};

DataManager.prototype.isNew = function(entity) {
    return !!entity._isNew;
};

DataManager.prototype.exec = function(method, args) {
    this.service[method].apply(this.service, args);
};

DataManager.prototype.withPromise = function() {
    this.asPromise = true;
    return this;
};