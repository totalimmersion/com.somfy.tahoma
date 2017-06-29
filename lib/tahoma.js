'use strict';

module.exports = {

	login: function(username, password, callback) {
		Homey.log("Logging in...", username, password);
		var err, result;
		result = {
			success: true
		}
		callback(err, result);
	}
}