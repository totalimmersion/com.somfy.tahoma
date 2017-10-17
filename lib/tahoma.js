'use strict';

const Homey = require('homey');
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
		return httpHelper.post(options, callback);
	},

	setup: function(callback) {
		var options = {
			uri: '/setup'
		};

		return httpHelper.get(options, callback);
	},

	getActionGroups: function(callback) {
		var options = {
			uri: '/actionGroups'
		};

		return httpHelper.get(options, callback);
	},

	getDeviceStateHistory: function(deviceUrl, state, from, to, callback) {
		var options = {
			uri: '/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to
		};

		return httpHelper.get(options, callback);
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

		return httpHelper.post(options, callback);
	},

	executeScenario: function(scenarioId, callback) {
		var options = {
			uri: '/exec/' + scenarioId
		};

		return httpHelper.post(options, callback);
	},

	cancelExecution: function(executionId, callback) {
		var options = {
			uri: '/exec/current/setup/' + executionId
		};

		return httpHelper.delete(options, callback);
	}
}

module.exports = taHoma;

var httpHelper = {

	get: function(options, callback) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.get(options, function(error, response, body) {
				if (error) {
					if (callback) {
						callback(error, null);
					}
					reject(error);
					return;
				}

				if (response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('get', options, callback);
					return;
				}

				try {
					if (callback) {
						callback(null, JSON.parse(body));
					}
					resolve(JSON.parse(body));
				} catch (e) {
					if (callback) {
						callback(e, null);
					}
					reject(e);
				}
			});
		});
	},

	post: function(options, callback) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.post(options, function(error, response, body) {
				if (error) {
					if (callback) {
						callback(error, null);
					}
					reject(error);
					return;
				}

				if (options.uri != '/login' && response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('post', options, callback);
					return;
				}

				try {
					var result = (options.json) ? body : JSON.parse(body);
					if (callback) {
						callback(null, result);
					}
					resolve(result);
				} catch (e) {
					if (callback) {
						callback(e, null);
					}
					reject(e);
				}
			});
		});
	},

	delete: function(options, callback) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.delete(options, function(error, response, body) {
				if (error) {
					if (callback) {
						callback(error, null);
					}
					reject(error);
					return;
				}

				if (options.uri != '/login' && response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('delete', options, callback);
					return;
				}

				if (callback) {
					callback(null, null);
				}
				resolve(null);
			});
		});
	},

	reAuthenticate: function(forwardMethod, forwardOptions, forwardCallback) {
		var _self = this;

		var username = Homey.ManagerSettings.get('username');
		var password = Homey.ManagerSettings.get('password');
		taHoma.login(username, password, function(err, result) {
			if (!err && result && result.success && typeof _self[forwardMethod] === 'function') {
				//successfully logged in
				_self[forwardMethod](forwardOptions, forwardCallback);
			}
		})
	}
};