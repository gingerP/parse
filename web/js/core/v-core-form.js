function FormController() {
}

FormController.prototype.init = function () {
    this.activeEntity = null;
    return this;
};

function FormComponent() {}

FormComponent.prototype = Object.create(BusinessRules.prototype);
FormComponent.prototype.constructor = FormComponent;

FormComponent.prototype.init = function(form, controller, dataConfig) {
    this.form = form;
    this.controller = controller;
    this.controller.owner = this;
    this.extendFormConfig = null;
    this.dataConfig = dataConfig;
    this.containers = {};
    return this;
};

FormComponent.prototype.initEvents = function() {
    var inst = this;

    this.form.attachEvent('onInputChange', function(name, value, form) {
        inst.runBRule(name, name, value);
    });

    this.form.attachEvent('onChange', function(name, value, checked) {
        if (inst.form.getItemType(name) == 'input') return;
        inst.runBRule(name, name, value);
    });

    this.form.attachEvent('onBlur', function (id) {
/*        var form = thiz.form;
        var type = form.getItemType(id);
        if (type == 'input' || type == 'textarea') {
            var value = form.getItemValue(id);
            form.setItemValue(id, blankIfNull(value).trim());
            form.validateItem(id);
            thiz.refreshState();
        } else if (type == 'combo') {
            // fix occasional error of right event not being fired for combos
            thiz.refreshState();
        }*/
    });
    this.form.attachEvent("onButtonClick", function(name) {
        inst.runButtonBRule(name, name);
    });
    return this;
};

FormComponent.prototype.setData = function(entity) {
    var inst = this;
    this.controller.activeEntity = entity;
    this.fillFormData(entity, this.dataConfig);
};

FormComponent.prototype.fillFormData = function(entity, mappings) {
    var inst = this;
    $.each(mappings, function(i, config) {
        var input = config.input;
        var property = config.property;
        inst.form.setItemValue(input, U.getDeepValue(entity, property) || '');
    })
};

FormComponent.prototype.getSnapshot = function() {
    var data = this.form.getFormData();
    return JSON.stringify(data);
};

FormComponent.prototype.takeSnapshot = function() {
    this.snapshot = this.getSnapshot();
    return this;
};

FormComponent.prototype.updateData = function(entity) {
    var formData = this.form.getFormData();
    var entity = entity || this.controller.activeEntity;
    return this.fillEntity(entity, this.dataConfig, formData);
};

FormComponent.prototype.fillEntity = function(entity, mappings, formData) {
    formData = formData || this.form.getFormData();
    //value, path, dest
    $.each(mappings, function(i, cfg) {
        var property = cfg.property;
        var input = cfg.input;
        if (property && input && formData.hasOwnProperty(input)) {
            U.setDeepValue(formData[input], property, entity);
        }
    });
    return entity;
};

FormComponent.prototype.updateContainerData = function(entity) {
    var dhxForm = this.form;
    var inst = this;
    dhxForm.forEachItem(function(name) {
        if (dhxForm.getType(name) == 'container' && typeof(inst.containers[name]) == 'function') {
            inst.containers[name](entity);
        }
    })
};

FormComponent.prototype.addContainersUpdate = function(cfg) {
    $.extend(this.containers, cfg || {});
};