'use strict';

const Homey = require('homey');
const HttpHelper = require('./HttpHelper');

class Tahoma extends Homey.SimpleClass {

	static login(username, password, callback) {
		var options = {
			uri: '/login',
			form: {
				userId: username,
				userPassword: password
			}
		};
		return HttpHelper.post(options, callback);
	}

	static setup(callback) {
		var options = {
			uri: '/setup'
		};

		return HttpHelper.get(options, callback);
	}

	static getActionGroups(callback) {
		var options = {
			uri: '/actionGroups'
		};

		return HttpHelper.get(options, callback);
	}

	static getDeviceStateHistory(deviceUrl, state, from, to, callback) {
		var options = {
			uri: '/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to
		};

		return HttpHelper.get(options, callback);
	}

	static executeDeviceAction(name, deviceUrl, action, callback) {
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

		return HttpHelper.post(options, callback);
	}

	static executeScenario(scenarioId, callback) {
		var options = {
			uri: '/exec/' + scenarioId
		};

		return HttpHelper.post(options, callback);
	}

	static cancelExecution(executionId, callback) {
		var options = {
			uri: '/exec/current/setup/' + executionId
		};

		return HttpHelper.delete(options, callback);
	}
}

module.exports = Tahoma;