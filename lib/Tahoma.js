'use strict';

const Homey = require('homey');

/**
 * Class for communicating with the TaHoma cloud service
 * @hideconstructor
 */
class Tahoma extends Homey.SimpleClass {

	/**
	 * Logs in the TaHoma service with the provided login credentials
	 * @param {string} username - Username which is used to login in TaHoma
	 * @param {string} password - Password which is used to login in TaHoma
	 * @returns {Promise<Object>}
	 * @async
	 */
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

	/**
	 * Gets the TaHoma device setup
	 * @returns {Promise<Object>}
	 */
	static setup(callback) {
		var options = {
			uri: '/setup'
		};

		return HttpHelper.get(options, callback);
	}

	/**
	 * Gets the actionGroups from TaHoma
	 * @returns {Promise<Object>}
	 */
	static getActionGroups(callback) {
		var options = {
			uri: '/actionGroups'
		};

		return HttpHelper.get(options, callback);
	}

	/**
	 * Gets the device state history from TaHoma
	 * @param {string} deviceUrl - The device url for the device as defined in TaHoma
	 * @param {string} state - The device state for which to retrieve the hisory
	 * @param {timestamp} from - The timestamp from which to retrieve the history
	 * @param {timestamp} to - The timestamp until to retrieve the history
	 * @returns {Promise<Object>}
	 */
	static getDeviceStateHistory(deviceUrl, state, from, to, callback) {
		var options = {
			uri: '/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to
		};

		return HttpHelper.get(options, callback);
	}

	/**
	 * Executes an action on a give device in TaHoma
	 * @returns {Promise<Object>}
	 * @async
	 */
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

	/**
	 * Executes a TaHoma scenario
	 * @param {string} scenarioId - The id of the scenario (oid in TaHoma)
	 * @returns {Promise<Object>}
	 * @async
	 */
	static executeScenario(scenarioId, callback) {
		var options = {
			uri: '/exec/' + scenarioId
		};

		return HttpHelper.post(options, callback);
	}

	/**
	 * Cancels the execution of a previously defined action
	 * @param {string} executionId - The execution id of the action
	 * @returns {Promise<Object>}
	 * @async
	 */
	static cancelExecution(executionId, callback) {
		var options = {
			uri: '/exec/current/setup/' + executionId
		};

		return HttpHelper.delete(options, callback);
	}
}

module.exports = Tahoma;

const HttpHelper = require('./HttpHelper');
