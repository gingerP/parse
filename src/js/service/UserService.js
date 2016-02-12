var model = {
	user: require('../models/User')
};
var md5 = require('md5');
var utils = require('../utils');
var c = require('../constants');
var userDBManager = require('../db/UserDBManager').instance;
var GenericService = require('./GenericService').class;
var service;

UserService = function() {};
UserService.prototype = Object.create(GenericService.prototype);
UserService.prototype.constructor = UserService;
UserService.prototype.create = function(name, password) {
	var inst = this;
	return new Promise(function(resolve, reject) {
		var user = Object.assign(model.user);
		user.name = name;
		user.pass = password;
		inst.save(user).then(function(data) {
			resolve(data);
		})
	});
};
UserService.prototype.changePassword = function(name, password) {
	var inst = this;
	return new Promise(function(resolve, reject) {
		inst.getByCriteria({name: name}).then(function(user) {
			if (user) {
				user.pass = md5(password);
				return inst.save(user);
			} else {
				reject();
			}
		}).then(function(data) {
			resolve(data);
		})
	});
};
UserService.prototype.doesUserExist = function(name, password) {
	var inst = this;
	var pass = md5(password);
	return new Promise(function(resolve, reject) {
		inst.getByCriteria({name: name, pass: pass}).then(function(user) {
			resolve(!!user);
		})
	})
};

UserService.prototype.getUser = function(name) {
	return this.getByCriteria({name: name});
};

service = new UserService();
service.setManager(userDBManager);

module.exports = {
	class: UserService,
	instance: service
};

