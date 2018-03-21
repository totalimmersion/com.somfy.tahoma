"use strict";

const Homey = require('homey');
const Tahoma = require('../../lib/Tahoma');

/**
 * Base class for drivers
 * @class
 * @extends {Homey.Driver}
 */
class Driver extends Homey.Driver {

	onPair(socket) {
		var _this = this;

		socket
			.on('list_devices', (data, callback) => {
				if (_this.deviceType && _this.deviceType instanceof Array && _this.deviceType.length > 0) {
					Tahoma.setup(function(err, data) {
						if (err) {
							return callback(err);
						}
						if (data && data.devices) {
							var devices = new Array();
							for (var i=0; i<data.devices.length; i++) {
								var device = data.devices[i];
								if (_this.deviceType.indexOf(device.controllableName) !== -1) {
									var device_data = {
										name: device.label,
										data: {
											id: device.oid,
											deviceURL: device.deviceURL,
											label: device.label
										}
									};
									devices.push(device_data);
								}
							}

							callback(null, devices);
						}
					});
				} else {
					callback(new Error('missing deviceType'));
				}
			})
			.on('disconnect', () => {
				this.log("User aborted pairing, or pairing is finished");
			});
	}

	/**
	 * Triggers a flow
	 * @param {Homey.FlowCardTriggerDevice} trigger - A Homey.FlowCardTriggerDevice instance
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
	triggerFlow(trigger, device, tokens, state) {
		if (trigger) {
			trigger
				.trigger(device, tokens, state)
				.then(this.log)
				.catch(this.error);
		}
	}

	/**
	 * Returns the io controllable name(s) of TaHoma
	 * @return {Array} deviceType
	 */
	getDeviceType() {
		return this.deviceType ? this.deviceType : false;
	}
};

module.exports = Driver;