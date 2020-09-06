'use strict';

const {
  SimpleClass,
  ManagerSettings,
  ManagerI18n
} = require('homey');
const Homey = require('homey');

const request = require('request');
const cookieJar = request.jar();

const tahomaRequest = request.defaults({
  baseUrl: 'https://www.tahomalink.com/enduser-mobile-web/enduserAPI',
  jar: cookieJar
});

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
      tahomaRequest.get(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }

        if (response.statusCode === 401) {
          //no longer authenticated -> login again
          return this.reAuthenticate('get', options)
            .then(result => resolve(result))
            .catch(error => reject(error));
        }

        try {
          resolve(JSON.parse(body));
        } catch (e) {
          Homey.app.logError("get", e);
          reject(e);
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
      tahomaRequest.post(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }

        if (options.uri !== '/login' && response.statusCode === 401) {
          //no longer authenticated -> login again
          return this.reAuthenticate('post', options)
            .then(result => resolve(result))
            .catch(error => {
              Homey.app.logError("post", error);
              reject(error)});
        }

        try {
          const result = (options.json) ? body : JSON.parse(body);
          resolve(result);
        } catch (e) {
          Homey.app.logError("post", e);
          reject(e);
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
      tahomaRequest.delete(options, (error, response) => {
        if (error) {
          return reject(error);
        }

        if (options.uri !== '/login' && response.statusCode === 401) {
          //no longer authenticated -> login again
          return this.reAuthenticate('delete', options)
            .then(result => resolve(result))
            .catch(error => {
              Homey.app.logError("delete", error);
              reject(error)
            });
        }

        resolve(null);
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