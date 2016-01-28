function GridController(dataManager) {
    this.dataManager = dataManager;
}

GridController.prototype.init = function (mappings) {
    this.mappings = mappings;
    return this;
};

GridController.prototype.onBeforeSelectionChange = function(newRow, oldRow) {
    return true;
};

GridController.prototype.onSelectionChange = function(rowId) {
    var entity = this.owner.getOrigUserData(rowId);
    this.owner.runSelectRules(entity);
    return this;
};

GridController.prototype.setData = function(data) {
    var inst = this;
    data = Array.isArray(data)? data: [data];
    this.owner.runPreRules(data);
    $.each(data, function(i, entity) {
        inst.owner.addRow(entity);
    });
    this.owner.runPostRules(data);
};

GridController.prototype.updateUserDataField = function(rowId, colName, value) {
    var data = this.owner.getData(rowId);
    var property;
    $.each(this.mappings, function(index, prop) {
        if (prop.input === colName) {
            property = prop.property;
            return false;
        }
    });
    U.setDeepValue(value, property, data);
    this.owner.setData(rowId);
};

GridController.prototype.reloadRow = function(rowId, entityId, callback, isSelect) {
    var inst = this;
    this.dataManager.get(entityId, function(data) {
        var newRowId;
        inst.owner.refreshRow(rowId, data);
        if (isSelect) {
            newRowId = inst.owner.getRowId(data);
            inst.onSelectionChange(newRowId);
        }
        if (typeof(callback) == 'function') {
            callback(data);
        }
    },
    this.mappings);
};

GridController.prototype.getDataArray = function(entity) {
    var result = [];
    $.each(this.owner.config, function(i, cfg) {
        var value = U.getDeepValue(entity, cfg.key);
        if (typeof(cfg.formatter) === 'function') {
            value = cfg.formatter(value, entity)
        }
        result.push(value);
    });
    return result;
};

function GridComponent() {
}

GridComponent.prototype = Object.create(BusinessRules.prototype);
GridComponent.prototype.constructor = GridComponent;

GridComponent.prototype.init = function (grid, controller, config) {
    this.controller = controller;
    this.controller.owner = this;
    this.grid = grid;
    this.config = config;
    this.grid.setHeader(this.extractCfg(this.config, 'header'));
    this.grid.setInitWidths(this.extractCfg(this.config, 'width', 100));
    this.grid.setColAlign(this.extractCfg(this.config, 'align', 'right'));
    this.grid.setColTypes(this.extractCfg(this.config, 'type', 'ro'));
    this.grid.setColSorting(this.extractCfg(this.config, 'sort', 'na'));
    this.initEvents();
    return this;
};

GridComponent.prototype.extractCfg = function(config, key, def) {
    var res = [];
    $.each(config, function(i, cfg) {
        res.push(cfg[key] || def || '');
    });
    return res.join(',');
};

GridComponent.prototype.getSingleSelected = function() {
    var result = this.grid.getSelectedRowId();
    result = U.hasContent(result)? result.split(',')[0]: null;
    return result;
};

GridComponent.prototype.clear = function() {
    this.grid.clearAll();
    this.controller.onSelectionChange();
    return this;
};

GridComponent.prototype.removeSelected = function() {
    this.grid.deleteSelectedRows();
    this.grid.clearSelection();
    this.controller.onSelectionChange();
    return this;
};

GridComponent.prototype.clearSelection = function() {
    this.grid.clearSelection();
    return this;
};

GridComponent.prototype.initEvents = function () {
    var thiz = this;
    // selection change events
    this.grid.attachEvent('onBeforeSelect', function (newRow, oldRow) {
        if (newRow == oldRow) return true;
        var canChange = thiz.controller.onBeforeSelectionChange(newRow, oldRow);
        thiz.runBeforeSelectBRules(newRow, oldRow, canChange);
        return canChange;
    });

    this.grid.attachEvent('onSelectStateChanged', function (selected) {
        thiz.controller.onSelectionChange(selected);
    });
    this.grid.attachEvent("onEditCancel",function(rId,cInd,val){
        return true;
    });
    this.grid.attachEvent("onEditCell", function(stage, rowId, columnInd, newValue, oldValue){
        var colName = thiz.getColName(columnInd);
        if (stage === 2) {
            thiz.controller.updateUserDataField(rowId, colName, newValue);
            thiz.runEditFinBRules(newValue, oldValue, rowId, columnInd, colName);
        }
        return true;
    });
    return this;
};

GridComponent.prototype.addRow = function(entity, select) {
    var rowArray = this.controller.getDataArray(entity);
    var rowId = this.getRowId(entity);
    this.grid.addRow(rowId, rowArray);
    this.setOrigUserData(entity);
    if (select === true) {
        this.grid.selectRowById(rowId, false, true, true);
    }
};

GridComponent.prototype.refreshRow = function(rowId, entity) {
    var newRowId = this.getRowId(entity);
    if (newRowId != rowId) {
        this.grid.changeRowId(rowId, newRowId);
    }
    var rowArray = this.controller.getDataArray(entity);
    this.grid.forEachCell(newRowId, function(cell, colIndex) {
        cell.setValue(rowArray[colIndex]);
    });
    this.setOrigUserData(entity);
};

GridComponent.prototype.setOrigUserData = function(entity) {
    var rowId = this.getRowId(entity);
    var copy = {};
    $.extend(true, copy, entity);
    this.grid.setUserData(rowId, 'orig', entity);
    this.setData(copy);
};

GridComponent.prototype.getOrigUserData = function(rowId) {
    return this.grid.getUserData(rowId, 'orig');
};

GridComponent.prototype.setData = function(entity) {
    var rowId = this.getRowId(entity);
    this.grid.setUserData(rowId, 'dyn', entity);
};

GridComponent.prototype.getData = function(rowId) {
    return this.grid.getUserData(rowId, 'dyn');
};

GridComponent.prototype.runSelectRules = function (entity) {
    this.runBRule('_select_', entity, entity);
    return this;
};

GridComponent.prototype.getRowId = function(entity) {
    var id = this.controller.dataManager.getId(entity);
    return '_' + id;
};

GridComponent.prototype.getSelectedData = function() {
    var result;
    var rowId = this.grid.getSelectedRowId();
    if (U.hasContent(rowId)) {
        result = this.getOrigUserData(rowId);
    }
    return result;
};

GridComponent.prototype.updateSelectedData = function(data) {
    this.setData(data);
    return this;
};

GridComponent.prototype.hasSelected = function() {
    var rowId = this.grid.getSelectedRowId();
    return U.hasContent(rowId);
};

GridComponent.prototype.getColIndex = function(name) {
    var result;
    $.each(this.config, function(index, configItem) {
        if (configItem.key === name) {
            result = index;
            return false;
        }
    });
    return result;
};

GridComponent.prototype.getColName = function(index) {
    return this.config[index]? this.config[index].key: null;
};

GridComponent.prototype.runEditFinBRules = function(newVal, oldVal, rowId, colId, colName) {
    var keys;
    for (var bRule in this.brules) {
        keys = bRule.split(';');
        if (keys.indexOf('__edit_fin') > -1 && keys.indexOf(colName) > -1) {
            this.brules[bRule].apply(this, [this, newVal, oldVal, rowId, colId, colName]);
        }
    }
};

GridComponent.prototype.runBeforeSelectBRules = function(newRow, oldRow, canChange) {
    var keys;
    for (var bRule in this.brules) {
        keys = bRule.split(';');
        if (keys.indexOf('__before_select') > -1) {
            this.brules[bRule].apply(this, [this, newRow, oldRow, canChange]);
        }
    }
};