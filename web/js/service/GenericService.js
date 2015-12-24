define([
	'./CoreTransport.js'
], function(transport) {
	var api;
	GenericService = function() {};
	GenericService.prototype.save = function(data, callback) {
		this._load(this.getUrl('save'), callback, data);
	};
	GenericService.prototype.get = function(id, callback, mappings) {
		this._load(this.getUrl('get'), callback, {id: id, mappings: mappings});
	};
	GenericService.prototype.remove = function(id, callback) {
		this._load(this.getUrl('delete'), callback, {id: id});
	};
	GenericService.prototype.list = function(callback, mappings) {
		this._load(this.getUrl('list'), callback, mappings);
	};
	GenericService.prototype._load = function(url, callback, data) {
		transport.load(url, callback, data);
	};
	//must be override
	GenericService.prototype.getNew = function() {
		return {};
	};
	GenericService.prototype.getUrl = function(url) {
		return this.getUrlPrefix() + '/' + url;
	};
	GenericService.prototype.getUrlPrefix = function() {
		return '';
	};
	api = {
		class: GenericService,
		instance: new GenericService()
	};
	return api;
});