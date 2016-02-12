function Toolbar() {}

Toolbar.prototype.init = function(dhXToolbar) {
    this.dhXToolbar = dhXToolbar;
    this.features = [];
    this.initEvents();
    return this;
};

Toolbar.prototype.addFeatures = function() {
    var inst = this;
    $.each(arguments, function(i, feature) {
        inst.features[feature.name] = feature;
        switch (feature.type) {
            case 'button':
                inst.dhXToolbar.addButton(
                    feature.name,
                    null,
                    feature.label,
                    feature.image,
                    feature.imageDis
                );
                break;
            case 'spacer':
                inst.dhXToolbar.addSpacer(feature.name);
                break;
            case 'separator':
                inst.dhXToolbar.addSeparator(U.getRandomString());
                break;
        }
    });
    return this;
};

Toolbar.prototype.initEvents = function() {
    var inst = this;
    this.dhXToolbar.attachEvent("onClick", function(id){
        var exec = inst.features[id].exec;
        if (typeof(exec) == 'function') {
            exec();
        }
    });
    return this;
};