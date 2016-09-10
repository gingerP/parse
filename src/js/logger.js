var log4js = require('log4js');
var logger;
const DEFAULT_LEVEL = 'INFO';
log4js.configure('src/cfg/log-properties.json');
logger = log4js.getLogger();
logger.setLevel(DEFAULT_LEVEL);
module.exports = {
	instance: logger,
	level: function(level) {
		logger.setLevel(level || DEFAULT_LEVEL);
		return logger;
	},
	create: function(category, path, level) {
		var logger = log4js.getLogger(category || '');
		logger.setLevel(level || DEFAULT_LEVEL);
		if (path) {
			log4js.addAppender(log4js.appenders.file(path), category || 'Logger');
		}
		return logger;
	},
	addFile: function(path, category) {
		log4js.addAppender(log4js.appenders.file(path), category || 'Logger');
	}
};