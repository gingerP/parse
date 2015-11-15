function GridController() {
}

GridController.prototype.init = function (mappings) {
    this.mappings = mappings;
    return this;
};

GridController.prototype.onBeforeSelectionChange = function (newRow, oldRow) {
    return true;
};

GridController.prototype.onSelectionChange = function (rowId) {
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

GridController.prototype.getDataArray = function (entity) {
    var result = [];
    $.each(this.owner.config, function(i, cfg) {
        var value = U.getDeepValue(entity, cfg.key);
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

GridComponent.prototype.initEvents = function () {
    var thiz = this;
    // selection change events
    this.grid.attachEvent('onBeforeSelect', function (newRow, oldRow) {
        if (newRow == oldRow) return true;
        var canChange = thiz.controller.onBeforeSelectionChange(newRow, oldRow);
        return canChange;
    });

    this.grid.attachEvent('onSelectStateChanged', function (selected) {
        thiz.controller.onSelectionChange(selected);
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

GridComponent.prototype.setOrigUserData = function(entity) {
    var rowId = this.getRowId(entity);
    this.grid.setUserData(rowId, 'orig', entity);
};

GridComponent.prototype.getOrigUserData = function(rowId) {
    return this.grid.getUserData(rowId, 'orig');
};

GridComponent.prototype.runSelectRules = function (entity) {
    this.runBRule('_select_', entity, entity);
    return this;
};

GridComponent.prototype.getRowId = function(entity) {
    return entity.id + '';
};

