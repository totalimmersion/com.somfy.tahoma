"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const Tahoma = require('../../lib/Tahoma');

/**
 * Device class for the light sensor with the io:LightIOSystemSensor controllable name in TaHoma
 * @extends {Device}
 */
class LightSensorDevice extends Device {

	onInit() {
		super.onInit();

        this.registerCapabilityListener('measure_luminance', this.onCapabilityMeasureLuminance.bind(this));
	}

	onCapabilityMeasureLuminance(value, opts) {
		var deviceData = this.getData();

		var oldLuminance = this.getState().measure_luminance;
		if (oldLuminance != value) {
			this.setCapabilityValue('measure_luminance', value);

			let device = this;
			let tokens = {
				'luminance': value
			};

			let state  = {
				'measure_luminance': value
			}

			//trigger flows
			let driver = this.getDriver();
			driver
				.triggerLuminanceMoreThan(device, tokens, state)
				.triggerLuminanceLessThan(device, tokens, state)
				.triggerLuminanceBetween(device, tokens, state);
		}

		return Promise.resolve();
	}

	/**
	 * Gets the sensor data from the TaHoma cloud
	 * @param {Array} data - device data from all the devices in the TaHoma cloud
	 */
	sync(data) {
		let device;

		for (let i=0; i<data.length; i++) {
			if (this.getData().id == data[i].oid) {
				device = data[i];
				continue;
			}
		}

		if (!device) {
			this.setUnavailable(null);
			return;
		}
		
		const range = 15 * 60 * 1000; //range of 15 minutes
		const to = Date.now();
		const from = to - range;
		
		Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:LuminanceState', from, to)
			.then(data => {
				//process result
				if (data.historyValues && data.historyValues.length > 0) {
					var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
					this.triggerCapabilityListener('measure_luminance', mostRecentMeasurement.value);
				}
			})
			.catch(error => {
				console.log(error.message, error.stack);
			});
	}
}

module.exports = LightSensorDevice;