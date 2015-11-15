function DataManager(service) {
    this.service = service;
}

DataManager.prototype.get = function(id, callback, mappings) {
    this.service.getEntity(id, callback, mappings);
};

DataManager.prototype.save = function(data, callback) {
    this.service.save(data, callback);
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
        $.each(keys, function(i, key) {
            if (key.indexOf('_') == 0) {
                delete entity[key];
            } else if (U.isObject(entity[key])) {
                inst.prepare(entity[key]);
            }
        })
    }
};