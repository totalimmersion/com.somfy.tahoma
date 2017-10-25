"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const taHoma = require('../../lib/tahoma');

const windowcoveringsStateMap = {
	up: 'open',
	idle: null,
	down: 'close'
};

//Device for a io:RollerShutterGenericIOComponent device
class RollerShutterDevice extends Device {

	onInit() {
		super.onInit();

        this.registerCapabilityListener('windowcoverings_state', this.onCapabilityWindowcoveringsState.bind(this));
	}

	onCapabilityWindowcoveringsState(value, opts, callback) {
		var _this = this;
		var deviceData = this.getData();
		var oldWindowCoveringsState = this.getState().windowcoverings_state;
		if (oldWindowCoveringsState != value) {
			if (value == 'idle' && this.getStoreValue('executionId')) {
				taHoma.cancelExecution(this.getStoreValue('executionId'), function(err, result) {
					if (!err) {
						//let's set the state to open, because Tahoma, doesn't have an idle state. If a blind isn't closed for 100%, the state will remain open.
						_this.setCapabilityValue('windowcoverings_state', value);
						if (callback) {
							callback(null, value);
						}
					}
				});
			} else if(!(oldWindowCoveringsState == 'idle' && opts.fromCloudSync == true)) {
				var action = {
					name: windowcoveringsStateMap[value],
					parameters: []
				};

				if (!opts.fromCloudSync) {
					taHoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action, function(err, result) {
						if (!err) {
							_this.setStoreValue('executionId', result.execId);
							_this.setCapabilityValue('windowcoverings_state', value);
							if (callback) {
								callback(null, value);
							}
						}
					});
				} else {
					_this.setCapabilityValue('windowcoverings_state', value);
				}
			}
		}
	}
}

module.exports = RollerShutterDevice;