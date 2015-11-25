var u = require('../utils');
function DataManager(vars) {
    var cfg = {
        url: '',
        configName: '',
        encoding: 'koi8r',
        cache: true
    };
    u.merge(cfg, vars);
    this.dataConfig = u.getCfg(cfg.configName);
    this.cfg = cfg;
};

DataManager.prototype.get = function(callback) {
    var cfg = this.cfg;
    if (typeof(callback) == 'function') {
        if (cfg.cache === true) {
            this._loadData(callback);
        } else {
            this._getDBData(callback);
        }
    }
};

DataManager.prototype._loadData = function(callback) {
    var cfg = this.cfg;
    var inst = this;
    u.loadDom(cfg.url, function(error, body) {
        if (typeof(callback) == 'function') {
            if (error) {
                callback(error);
            } else {
                u.extractDataFromHtml(body, inst.dataConfig, callback);
            }
        }
    }, cfg.encoding);
};

DataManager.prototype._getDBData = function() {

};

module.exports = DataManager;