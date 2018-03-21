'use strict';

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
class HttpHelper extends Homey.SimpleClass {

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
	get(options, callback) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.get(options, function(error, response, body) {
				if (error) {
					if (callback) {
						callback(error, null);
					}
					reject(error);
					return;
				}

				if (response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('get', options, callback);
					return;
				}

				try {
					if (callback) {
						callback(null, JSON.parse(body));
					}
					resolve(JSON.parse(body));
				} catch (e) {
					if (callback) {
						callback(e, null);
					}
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
	post(options, callback) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.post(options, function(error, response, body) {
				if (error) {
					if (callback) {
						callback(error, null);
					}
					reject(error);
					return;
				}

				if (options.uri != '/login' && response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('post', options, callback);
					return;
				}

				try {
					var result = (options.json) ? body : JSON.parse(body);
					if (callback) {
						callback(null, result);
					}
					resolve(result);
				} catch (e) {
					if (callback) {
						callback(e, null);
					}
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
	delete(options, callback) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.delete(options, function(error, response, body) {
				if (error) {
					if (callback) {
						callback(error, null);
					}
					reject(error);
					return;
				}

				if (options.uri != '/login' && response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('delete', options, callback);
					return;
				}

				if (callback) {
					callback(null, null);
				}
				resolve(null);
			});
		});
	}

	reAuthenticate(forwardMethod, forwardOptions, forwardCallback) {
		var _self = this;

		var username = Homey.ManagerSettings.get('username');
		var password = Homey.ManagerSettings.get('password');
		Tahoma.login(username, password, function(err, result) {
			if (!err && result && result.success && typeof _self[forwardMethod] === 'function') {
				//successfully logged in
				_self[forwardMethod](forwardOptions, forwardCallback);
			}
		});
	}
}

module.exports = new HttpHelper();

const Tahoma = require('./Tahoma');
