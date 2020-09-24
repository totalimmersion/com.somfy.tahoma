'use strict';

/* eslint-disable no-use-before-define */

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

    const encodeForm = (data) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
    }

    let formData = {
      userId: username,
      userPassword: password
    };

    const data = encodeForm((formData));
    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': data.length,
        'host': 'www.tahomalink.com'
      }
    };

    return HttpHelper.post('/login', config, data);
  }
  /**
   * Logout of the TaHoma service
   * @returns {Promise<Object>}
   * @async
   */
  static logout() {
    return HttpHelper.post('/logout');
  }

  /**
   * Gets the TaHoma device setup
   * @returns {Promise<Object>}
   * @async
   */
  static setup() {
    if (process.env.DEBUG === '1') {
      const simData = Homey.ManagerSettings.get('simData');
      if (simData) {
        return new Promise((resolve, reject) => {
          resolve(simData);
        })
      }
    }
    return HttpHelper.get('/setup');
  }

  /**
   * Gets the actionGroups from TaHoma
   * @returns {Promise<Object>}
   * @async
   */
  static getActionGroups() {
    return HttpHelper.get('/actionGroups');
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
    return HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to);
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
      json: true,
      data: {
        label: name + ' - ' + action.name + '  - Homey',
        actions: [{
          deviceURL: deviceUrl,
          commands: [
            action
          ]
        }]
      }
    };

    return HttpHelper.post('/exec/apply', options);
  }

  /**
   * Executes a TaHoma scenario
   * @param {string} scenarioId - The id of the scenario (oid in TaHoma)
   * @returns {Promise<Object>}
   * @async
   */
  static executeScenario(scenarioId) {
    return HttpHelper.post('/exec/' + scenarioId);
  }

  /**
   * Cancels the execution of a previously defined action
   * @param {string} executionId - The execution id of the action
   * @returns {Promise<Object>}
   * @async
   */
  static cancelExecution(executionId) {
    return HttpHelper.delete('/exec/current/setup/' + executionId);
  }
}

module.exports = Tahoma;

const HttpHelper = require('./HttpHelper');