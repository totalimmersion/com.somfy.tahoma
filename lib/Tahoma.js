'use strict';

/* eslint-disable no-use-before-define */

const Homey = require('homey');

const SOMFY_OAUTH_URL = 'https://accounts.somfy.com/oauth/oauth/v2/token';
const SOMFY_OAUTH_CLIENT_ID = '0d8e920c-1478-11e7-a377-02dd59bd3041_1ewvaqmclfogo4kcsoo0c8k4kso884owg08sg8c40sk4go4ksg';
const SOMFY_OAUTH_CLIENT_SECRET = '12k73w1n540g8o4cokg0cw84cog840k84cwggscwg884004kgk';

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
  static async login(username, password, linkurl, oauthLogin) {
    HttpHelper.setBaseURL(linkurl);
    const host = HttpHelper.getHostName(linkurl);

    const encodeForm = (data) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
    }

    if (!oauthLogin) {
      // Use simple login
      let formData = {
        userId: username,
        userPassword: password
      };

      const data = encodeForm((formData));
      const config = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': data.length,
          'host': host
        }
      };

      return await HttpHelper.post('/login', config, data);
    } else {
      //Use OAuth logi
      let formData = {
        grant_type: 'password',
        username: username,
        password: password,
        client_id: SOMFY_OAUTH_CLIENT_ID,
        client_secret: SOMFY_OAUTH_CLIENT_SECRET,
      };
      const data = encodeForm((formData));
      const config = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': data.length,
          'host': 'accounts.somfy.com'
        }
      };

      const result = await HttpHelper.post(SOMFY_OAUTH_URL, config, data)
      const headers = {
        Authorization: "Bearer " + result['access_token']
      };
      HttpHelper.setDefaultHeaders(headers);
      return result;
    }
  }

  /**
   * Logout of the TaHoma service
   * @returns {Promise<Object>}
   * @async
   */
  static async logout() {
    return await HttpHelper.post('/logout');
  }

  /**
   * Gets the TaHoma device setup
   * @returns {Promise<Object>}
   * @async
   */
  static async getDeviceData() {
    if (process.env.DEBUG === '1') {
      const simData = Homey.ManagerSettings.get('simData');
      if (simData) {
        return simData;
      }
    }
    return await HttpHelper.get('/setup');
  }

  /**
   * Gets the actionGroups from TaHoma
   * @returns {Promise<Object>}
   * @async
   */
  static async getActionGroups() {
    return await HttpHelper.get('/actionGroups');
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
  static async getDeviceStateHistory(deviceUrl, state, from, to) {
    return await HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to);
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
  static async executeDeviceAction(name, deviceUrl, action) {
    const data = {
      label: name + ' - ' + action.name + '  - Homey',
      actions: [{
        deviceURL: deviceUrl,
        commands: [
          action
        ]
      }]
    };

    const options = {
      json: true,
    };

    return await HttpHelper.post('/exec/apply', options, data);
  }

  /**
   * Executes a TaHoma scenario
   * @param {string} scenarioId - The id of the scenario (oid in TaHoma)
   * @returns {Promise<Object>}
   * @async
   */
  static async executeScenario(scenarioId) {
    return await HttpHelper.post('/exec/' + scenarioId);
  }

  /**
   * Cancels the execution of a previously defined action
   * @param {string} executionId - The execution id of the action
   * @returns {Promise<Object>}
   * @async
   */
  static async cancelExecution(executionId) {
    return await HttpHelper.delete('/exec/current/setup/' + executionId);
  }

  static updateBaseURL(linkurl) {
    HttpHelper.setBaseURL(linkurl);
  }
}

module.exports = Tahoma;

const HttpHelper = require('./HttpHelper');