var log4js = require('log4js');
const DEFAULT_LEVEL = 'INFO';
log4js.setLevel(DEFAULT_LEVEL);
log4js.configure('./log-properties.json');
module.exports = {
		level: function(level) {
				log4js.setLevel(level || DEFAULT_LEVEL);
				return log4js;
		},
		instance: log4js
};