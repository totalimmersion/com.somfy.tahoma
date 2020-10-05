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

class HttpHelper extends SimpleClass {

  constructor() {
    if (!instance) {
      super();
      instance = this;
    }

    this.setBaseURL(Homey.ManagerSettings.get('linkurl'));

    return instance;
  }

  setDefaultHeaders(headers) {
    axios.defaults.withCredentials = false;
    axios.defaults.headers = headers;
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

  async get(uri, config, firstTime = true) {
    try {
      const response = await axios.get(uri, config)
      return response.data;
    } catch (error) {
      Homey.app.logError("get", error);
      if (firstTime && error.response && error.response.status === 401) {
        //no longer authenticated -> login again
        Homey.app.logError("get", {
          message: "Access token expired -> logging in again",
          stack: ""
        });
        await this.reAuthenticate();
        await this.get(uri, config, false);
      } else {
        throw (new Error("Login Failed"));
      }
    }
  }

  async post(uri, config, data, firstTime = true) {
    try {
      const response = await axios.post(uri, data, config)
      return response.data;
    } catch (error) {
      Homey.app.logError("post", error);
      if (firstTime && error.response && error.response.status === 401) {
        if (uri !== '/login') {
          //no longer authenticated -> login again
          Homey.app.logError("post", {
            message: "Access token expired -> logging in again",
            stack: ""
          });
          await this.reAuthenticate();
          await this.post(uri, config, data), false;
        } else {
          //Authentication failed
          Homey.app.logError("post", {
            message: "Authentication failed",
            stack: "Ensure the Username and Password are entered correctly in the Apps Configuration page."
          });
        }
      } else {
        throw (new Error("Login Failed"));
      }
    }
  }

  async delete(uri, config, firstTime = false) {
    try {
      await axios.delete(uri, config)
    } catch (error) {
      if (firstTime && error.response && error.response.status === 401 && uri !== '/login') {
        //no longer authenticated -> login again
        await this.reAuthenticate();
        await this.delete(uri, config, false);
      } else {
        Homey.app.logError("delete", error);
        throw (new Error(error));
      }
    }
  }

  async reAuthenticate() {
    const username = ManagerSettings.get('username');
    const password = ManagerSettings.get('password');
    const linkurl = Homey.ManagerSettings.get('linkurl');
    const loginMethod = Homey.ManagerSettings.get('loginMethod');
    await Tahoma.login(username, password, linkurl, loginMethod);
  }
}
module.exports = new HttpHelper();

const Tahoma = require('./Tahoma');