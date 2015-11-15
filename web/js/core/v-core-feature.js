function GenericFeature() {}


GenericFeature.prototype.init = function(vars) {
    this.type = vars.type;
    this.name = vars.name;
    this.label = vars.label;
    this.image = vars.image;
    this.imageDis = vars.imageDis;
    return this;
};
GenericFeature.prototype.exec = function() {};
GenericFeature.prototype.isEnabled = function() {};
GenericFeature.prototype.isVisible = function() {};