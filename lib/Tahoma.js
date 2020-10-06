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

  // Throws an error if the login fails
  static async login(username, password, linkurl, oauthLogin) {
    HttpHelper.setBaseURL(linkurl);

    const encodeForm = (data) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
    }

    if (!oauthLogin) {
      // Use simple login
      //Clear the headers and use credentials
      HttpHelper.setDefaultHeaders({}, true);

      let formData = {
        userId: username,
        userPassword: password
      };

      const data = encodeForm((formData));
      const config = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': data.length,
          'host': HttpHelper.getHostName(linkurl)
        }
      };

      const result = await HttpHelper.postLogin('/login', config, data);
      Homey.app.logError("Simple Login", {
        message: "Successful",
        stack: result
      });

    } else {
      //Use OAuth login
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

      // Throws an exception if login fails
      const result = await HttpHelper.postLogin(SOMFY_OAUTH_URL, config, data)
      Homey.app.logError("OAuth Login", {
        message: "Successful",
        stack: result
      });

      const headers = {
        Authorization: "Bearer " + result['access_token']
      };
      HttpHelper.setDefaultHeaders(headers, false);
    }
  }

  static async logout() {
    await HttpHelper.post('/logout');
    //Clear the headers and don't use credentials
    HttpHelper.setDefaultHeaders({}, false);
  }

  static async getDeviceData() {
    if (process.env.DEBUG === '1') {
      const simData = Homey.ManagerSettings.get('simData');
      if (simData) {
        return simData;
      }
    }
    return await HttpHelper.get('/setup');
  }

  static async getDeviceStates(deviceUrl) {
    const states = await HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states');
    if (this.isEmpty(states)){
      return null;
    }

    return states;
  }

  static async getDeviceSingleState(deviceUrl, state) {
    return await HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state));
  }

  static async getActionGroups() {
    return await HttpHelper.get('/actionGroups');
  }

  /**
   * Gets the device state history from TaHoma
   * @param {string} deviceUrl - The device url for the device as defined in TaHoma
   * @param {string} state - The device state for which to retrieve the hisory
   * @param {timestamp} from - The timestamp from which to retrieve the history
   * @param {timestamp} to - The timestamp until to retrieve the history
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

  static isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
}

module.exports = Tahoma;

const HttpHelper = require('./HttpHelper');