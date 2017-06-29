'use strict';

var request = require('request');
var cookieJar = request.jar();

var tahomaRequest = request.defaults({
	baseUrl: 'https://www.tahomalink.com/enduser-mobile-web/enduserAPI',
	jar: cookieJar
});

module.exports = {

	login: function(username, password, callback) {
		var options = {
			uri: '/login',
			form: {
				userId: username,
				userPassword: password
			}
		};
		post(options, callback);
	},

	setup: function() {
		var options = {
			uri: '/setup'
		}
		get(options);
	}
}

var defaultCallback = function(error, response, body) {

};

var get = function(options, callback) {
	tahomaRequest.get(options, function(error, response, body) {
		Homey.log(JSON.parse(body));
	});
};

var post = function(options, callback) {
	tahomaRequest.post(options, function(error, response, body) {
		Homey.log(JSON.parse(body));
		callback(null, JSON.parse(body));
	});
};