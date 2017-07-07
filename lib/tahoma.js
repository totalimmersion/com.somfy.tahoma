'use strict';

var request = require('request');
var cookieJar = request.jar();

var tahomaRequest = request.defaults({
	baseUrl: 'https://www.tahomalink.com/enduser-mobile-web/enduserAPI',
	jar: cookieJar
});

var taHoma = {

	login: function(username, password, callback) {
		var options = {
			uri: '/login',
			form: {
				userId: username,
				userPassword: password
			}
		};
		httpHelper.post(options, callback);
	},

	setup: function(callback) {
		var options = {
			uri: '/setup'
		};

		httpHelper.get(options, callback);
	},

	getActionGroups: function(callback) {
		var options = {
			uri: '/actionGroups'
		};

		httpHelper.get(options, callback);
	},

	getDeviceStateHistory: function(deviceUrl, state, from, to, callback) {
		var options = {
			uri: '/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to
		};

		httpHelper.get(options, callback);
	},

	executeDeviceAction: function(name, deviceUrl, action, callback) {
		var options = {
			uri: '/exec/apply',
			json: true,
			body: {
				label: name + " - " + action.name + "  - Homey",
				actions: [
					{
						deviceURL: deviceUrl,
						commands: [
							action
						]
					}
				]
			}
		};

		httpHelper.post(options, callback);
	},

	executeScenario: function(scenarioId, callback) {
		var options = {
			uri: '/exec/' + scenarioId
		};

		httpHelper.post(options, callback);
	},

	cancelExecution: function(executionId, callback) {
		var options = {
			uri: '/exec/current/setup/' + executionId
		};

		httpHelper.delete(options, callback);
	}
}

module.exports = taHoma;

var httpHelper = {

	get: function(options, callback) {
		var _self = this;

		tahomaRequest.get(options, function(error, response, body) {
			if (error) {
				callback(error, null);
				return;
			}

			if (response.statusCode == 401) {
				//no longer authenticated -> login again
				_self.reAuthenticate('get', options, callback);
				return;
			}
			callback(null, JSON.parse(body));
		});
	},

	post: function(options, callback) {
		var _self = this;

		tahomaRequest.post(options, function(error, response, body) {
			if (error) {
				callback(error, null);
				return;
			}

			if (options.uri != '/login' && response.statusCode == 401) {
				//no longer authenticated -> login again
				_self.reAuthenticate('post', options, callback);
				return;
			}
			var result = (options.json) ? body : JSON.parse(body);
			//Homey.log(JSON.stringify(options), result);
			callback(null, result);
		});
	},

	delete: function(options, callback) {
		var _self = this;

		tahomaRequest.delete(options, function(error, response, body) {
			if (error) {
				callback(error, null);
				return;
			}

			if (options.uri != '/login' && response.statusCode == 401) {
				//no longer authenticated -> login again
				_self.reAuthenticate('delete', options, callback);
				return;
			}
			callback(null, null);
		});
	},

	reAuthenticate: function(forwardMethod, forwardOptions, forwardCallback) {
		var _self = this;

		var username = Homey.manager('settings').get('username');
		var password = Homey.manager('settings').get('password');
		taHoma.login(username, password, function(err, result) {
			if (result.success && typeof _self[forwardMethod] === 'function') {
				//successfully logged in
				_self[forwardMethod](forwardOptions, forwardCallback);
			}
		})
	}
};