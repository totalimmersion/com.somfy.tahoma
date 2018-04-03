"use strict";

const Homey = require('homey');
const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const deviceHelper = require('../../lib/helper').Device;

/**
 * Device class for the light sensor with the io:LightIOSystemSensor controllable name in TaHoma
 * @extends {Device}
 */
class LightSensorDevice extends SensorDevice {

	onInit() {
        this.registerCapabilityListener('measure_luminance', this.onCapabilityMeasureLuminance.bind(this));

   		super.onInit();
	}

	onCapabilityMeasureLuminance(value, opts) {
		const oldLuminance = this.getState().measure_luminance;
		if (oldLuminance != value) {
			this.setCapabilityValue('measure_luminance', value);

			const device = this;
			const tokens = {
				'luminance': value
			};

			const state  = {
				'measure_luminance': value
			}

			//trigger flows
			this.getDriver()
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
		const device = data.find(deviceHelper.isSameDevice(this.getData().id), this);
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
					var mostRecentMeasurement = genericHelper.getLastItemFrom(data.historyValues);
					this.triggerCapabilityListener('measure_luminance', mostRecentMeasurement.value);
				}
			})
			.catch(error => {
				console.log(error.message, error.stack);
			});

		super.sync(data);
	}
}

module.exports = LightSensorDevice;