"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const taHoma = require('../../lib/tahoma');

const windowcoveringsStateMap = {
	up: 'open',
	idle: null,
	down: 'close'
};

//Device for a io:VerticalExteriorAwningIOComponent device
class VerticalExteriorBlindDevice extends Device {

	onInit() {
		this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this.registerCapabilityListener('windowcoverings_state', this.onCapabilityWindowcoveringsState.bind(this));
	}

	onAdded() {
		this.log('device added');
	}

	onDeleted() {
		this.log('device deleted');
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
						callback(null, value);
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
							module.exports.realtime(deviceData, 'windowcoverings_state', value);
							callback(null, value);
						}
					});
				} else {
					device.state.windowcoverings_state = state;
				}
			}
		}

	}
}

module.exports = VerticalExteriorBlindDevice;