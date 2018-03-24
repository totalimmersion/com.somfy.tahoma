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
	get(options) {
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.get(options, function(error, response, body) {
				if (error) {
					reject(error);
					return;
				}

				if (response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('get', options)
						.then(result => resolve(result))
						.catch(error => reject(error));
					return;
				}

				try {
					resolve(JSON.parse(body));
				} catch (e) {
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
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.post(options, function(error, response, body) {
				if (error) {
					reject(error);
					return;
				}

				if (options.uri != '/login' && response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('post', options)
						.then(result => resolve(result))
						.catch(error => reject(error));
					return;
				}

				try {
					var result = (options.json) ? body : JSON.parse(body);
					resolve(result);
				} catch (e) {
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
		var _self = this;

		return new Promise((resolve, reject) => {
			tahomaRequest.delete(options, function(error, response, body) {
				if (error) {
					reject(error);
					return;
				}

				if (options.uri != '/login' && response.statusCode == 401) {
					//no longer authenticated -> login again
					_self.reAuthenticate('delete', options)
						.then(result => resolve(result))
						.catch(error => reject(error));
					return;
				}

				resolve(null);
			});
		});
	}

	reAuthenticate(forwardMethod, forwardOptions) {
		var _self = this;

		return new Promise((resolve, reject) => {
			const username = Homey.ManagerSettings.get('username');
			const password = Homey.ManagerSettings.get('password');
			Tahoma.login(username, password)
				.then(result => {
					if (result.success && typeof _self[forwardMethod] === 'function') {
						_self[forwardMethod](forwardOptions)
							.then(result => resolve(result))
							.catch(error => reject(error));
					}
				})
				.catch(error => {
					console.log(error.message, error.stack);
					reject(error);
				});
		});
	}
}

module.exports = new HttpHelper();

const Tahoma = require('./Tahoma');
