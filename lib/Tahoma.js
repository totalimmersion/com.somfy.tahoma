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
	static login(username, password) {
		const options = {
			uri: '/login',
			form: {
				userId: username,
				userPassword: password
			}
		}

		return HttpHelper.post(options);
	}
	/**
	 * Logout of the TaHoma service
	 * @returns {Promise<Object>}
	 * @async
	 */
	static logout() {
		const options = {
			uri: '/logout'
		}

		return HttpHelper.post(options);
	}

	/**
	 * Gets the TaHoma device setup
	 * @returns {Promise<Object>}
	 * @async
	 */
	static setup() {
		const options = {
			uri: '/setup'
		}

		return HttpHelper.get(options);
	}

	/**
	 * Gets the actionGroups from TaHoma
	 * @returns {Promise<Object>}
	 * @async
	 */
	static getActionGroups() {
		const options = {
			uri: '/actionGroups'
		}

		return HttpHelper.get(options);
	}

	/**
	 * Gets the device state history from TaHoma
	 * @param {string} deviceUrl - The device url for the device as defined in TaHoma
	 * @param {string} state - The device state for which to retrieve the hisory
	 * @param {timestamp} from - The timestamp from which to retrieve the history
	 * @param {timestamp} to - The timestamp until to retrieve the history
	 * @returns {Promise<Object>}
	 * @async
	 */
	static getDeviceStateHistory(deviceUrl, state, from, to) {
		const options = {
			uri: '/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to
		}

		return HttpHelper.get(options);
	}

	/**
	 * Executes an action on a give device in TaHoma
	 * @param {string} name - Name of the device
	 * @param {string} deviceUrl - Url of the device
	 * @param {Object} action - An object defining the action to be executed in TaHoma
	 * @example
	 * const action = {
	 *    name: 'open',
	 *    parameters: []
	 * };
	 *
	 * Tahoma.executeDeviceAction('device name', 'url/of/the/device', action)
	 *    .then(result => {
	 *       //process result
	 *    })
	 *    .catch(error => {
	 *       //handle error
	 *    });
	 * @returns {Promise<Object>}
	 * @async
	 */
	static executeDeviceAction(name, deviceUrl, action) {
		const options = {
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
		}

		return HttpHelper.post(options);
	}

	/**
	 * Executes a TaHoma scenario
	 * @param {string} scenarioId - The id of the scenario (oid in TaHoma)
	 * @returns {Promise<Object>}
	 * @async
	 */
	static executeScenario(scenarioId) {
		const options = {
			uri: '/exec/' + scenarioId
		}

		return HttpHelper.post(options);
	}

	/**
	 * Cancels the execution of a previously defined action
	 * @param {string} executionId - The execution id of the action
	 * @returns {Promise<Object>}
	 * @async
	 */
	static cancelExecution(executionId) {
		const options = {
			uri: '/exec/current/setup/' + executionId
		}

		return HttpHelper.delete(options);
	}
}

module.exports = Tahoma;

const HttpHelper = require('./HttpHelper');
