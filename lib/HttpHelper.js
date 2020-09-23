'use strict';

const {
  SimpleClass,
  ManagerSettings,
  ManagerI18n
} = require('homey');
const Homey = require('homey');

const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;

let instance = null;

/**
 * Helper for managing http requests to TaHoma cloud
 * @static
 * @hideconstructor
 * @example
 * const HttpHelper = require('./HttpHelper');
 * HttpHelper.get({ uri: '/url/path' })
 *   .then(data => {
 *      //process data
 *   })
 *   .catch(error => {
 *      //handle error
 *   });
 */
class HttpHelper extends SimpleClass {

  constructor() {
    if (!instance) {
      super();
      instance = this;
    }

    axios.defaults.baseURL = 'https://www.tahomalink.com/enduser-mobile-web/enduserAPI';

    return instance;
  }

  /**
   * Makes an async http get request to TaHoma
   * @async
   * @param {Object} options
   * @return {Promise<Object>}
   */
  get(options) {
    return new Promise((resolve, reject) => {
      axios.get(options.uri, options)
        .then((response) => {
          try {
            resolve(JSON.parse(response.data));
          } catch (e) {
            Homey.app.logError("get", e);
            reject(e);
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            //no longer authenticated -> login again
            return this.reAuthenticate('get', options)
              .then(result => resolve(result))
              .catch(error => reject(error));
          }
        });
    });
  }

  /**
   * Makes an async http post request to TaHoma
   * @async
   * @param {Object} options
   * @return {Promise<Object>}
   */
  post(options) {
    return new Promise((resolve, reject) => {
      axios.post(options.uri, options)
        .then((response) => {
          try {
            const result = (options.json) ? response.data : JSON.parse(response.data);
            resolve(result);
          } catch (e) {
            Homey.app.logError("post", e);
            reject(e);
          }
        })
        .catch((error) => {
          if (error.response.status === 401 && options.uri !== '/login') {
            //no longer authenticated -> login again
            return this.reAuthenticate('get', options)
              .then(result => resolve(result))
              .catch(error => reject(error));
          } else {
            return reject(error);
          }
        });
    });
  }

  /**
   * Makes an async http delete request to TaHoma
   * @async
   * @param {Object} options
   * @return {Promise}
   */
  delete(options) {
    return new Promise((resolve, reject) => {
      axios.delete(options.uri, options)
        .catch((error, response) => {
          return reject(error);
        })
        .then((response) => {
          if (error.response.status === 401 && options.uri !== '/login') {
            //no longer authenticated -> login again
            return this.reAuthenticate('get', options)
              .then(result => resolve(result))
              .catch(error => reject(error));
          } else {
            return reject(error);
          }
        });
    });
  }

  reAuthenticate(forwardMethod, forwardOptions) {
    return new Promise((resolve, reject) => {
      const username = ManagerSettings.get('username');
      const password = ManagerSettings.get('password');
      Tahoma.login(username, password) // eslint-disable-line no-use-before-define
        .then(result => {
          if (result.success && typeof this[forwardMethod] === 'function') {
            this[forwardMethod](forwardOptions)
              .then(result => resolve(result))
              .catch(error => reject(error));
          } else {
            const message = ManagerI18n.__('errors.on_pair_login_failure');
            reject(new Error(message));
          }
        })
        .catch(error => {
          Homey.app.logError("reAuthenticate", error);
          reject(error);
        });
    });
  }
}

module.exports = new HttpHelper();

const Tahoma = require('./Tahoma');