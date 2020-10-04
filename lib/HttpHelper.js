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

    this.setBaseURL(Homey.ManagerSettings.get('linkurl'));

    return instance;
  }

  setBaseURL(linkurl) {
    axios.defaults.baseURL = this.getBaseURL(linkurl);
  }

  getBaseURL(linkurl) {
    if (linkurl === 'alt1') {
      return 'https://ha201-1.overkiz.com/enduser-mobile-web/enduserAPI';
    } else if (linkurl === 'alt2') {
      return 'https://ha110-1.overkiz.com/enduser-mobile-web/enduserAPI';
    }
    return 'https://www.tahomalink.com/enduser-mobile-web/enduserAPI';
  }

  getHostName(linkurl) {
    if (linkurl === 'alt1') {
      return 'ha201-1.overkiz.com';
    } else if (linkurl === 'alt2') {
      return 'ha110-1.overkiz.com';
    }
    return 'www.tahomalink.com';
  }

  /**
   * Makes an async http get request to TaHoma
   * @async
   * @param {Object} config
   * @return {Promise<Object>}
   */
  get(uri, config) {
    return new Promise((resolve, reject) => {
      axios.get(uri, config)
        .then((response) => {
          try {
            resolve(response.data);
          } catch (e) {
            Homey.app.logError("get", e);
            reject(e);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            //no longer authenticated -> login again
            Homey.app.logError("get", {
              message: "Access token expired -> logging in again",
              stack: ""
            });
            return this.reAuthenticate('get', uri, config)
              .then(result => resolve(result))
              .catch(error => reject(error));
          } else {
            Homey.app.logError("get", error);
            return reject(error);
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
  post(uri, config, data) {
    return new Promise((resolve, reject) => {
      axios.post(uri, data, config)
        .then((response) => {
          try {
            resolve(response.data);
          } catch (e) {
            Homey.app.logError("post", e);
            reject(e);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            if (uri !== '/login') {
              //no longer authenticated -> login again
              Homey.app.logError("post", {
                message: "Access token expired -> logging in again",
                stack: ""
              });
              return this.reAuthenticate('post', uri, config, data)
                .then(result => resolve(result))
                .catch(error => reject(error));
            } else {
              //Authentication failed
              Homey.app.logError("post", {
                message: "Authentication failed",
                stack: "Ensure the Username and Password are entered correctly in the Apps Configuration page."
              });
              return reject(Error("Authentication failed"));
            }
          } else {
            Homey.app.logError("post", error);
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
  delete(uri, config) {
    return new Promise((resolve, reject) => {
      axios.delete(uri, config)
        .catch((error) => {
          if (error.response && error.response.status === 401 && uri !== '/login') {
            //no longer authenticated -> login again
            return this.reAuthenticate('delete', uri, config)
              .then(result => resolve(result))
              .catch(error => reject(error));
          } else {
            Homey.app.logError("delete", error);
            return reject(error);
          }
        })
        .then((response) => {
          resolve(response);
        });
    });
  }

  reAuthenticate(forwardMethod, forwardUri, forwardConfig, forwardData) {
    return new Promise((resolve, reject) => {
      // Add a 5 second delay between attempts
      setTimeout(() => {
        const username = ManagerSettings.get('username');
        const password = ManagerSettings.get('password');
        const linkurl = Homey.ManagerSettings.get('linkurl')
        Tahoma.login(username, password, linkurl) // eslint-disable-line no-use-before-define
          .then(result => {
            if (result.success && typeof this[forwardMethod] === 'function') {
              this[forwardMethod](forwardUri, forwardConfig, forwardData)
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
    }, 5000);
  }
}

module.exports = new HttpHelper();

const Tahoma = require('./Tahoma');