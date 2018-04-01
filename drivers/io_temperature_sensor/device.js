"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const Tahoma = require('../../lib/Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const deviceHelper = require('../../lib/helper').Device;

/**
 * Device class for the temperature sensor with the io:TemperatureIOSystemSensor controllable name in TaHoma
 * @extends {Device}
 */
class TemperatureSensorDevice extends Device {

	onInit() {
		super.onInit();

        this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasureTemperature.bind(this));
	}

	onCapabilityMeasureTemperature(value, opts) {
		var deviceData = this.getData();

		var oldTemperature = this.getState().measure_temperature;
		if (oldTemperature != value) {
			this.setCapabilityValue('measure_temperature', value);

			let device = this;
			let tokens = {
				'temperature': value
			};

			let state  = {
				'measure_temperature': value
			}

			//trigger flows
			let driver = this.getDriver();
			driver
				.triggerTemperatureMoreThan(device, tokens, state)
				.triggerTemperatureLessThan(device, tokens, state)
				.triggerTemperatureBetween(device, tokens, state);
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
		const kelvinOffset = 273.15;
		
		Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:TemperatureState', from, to)
			.then(data => {
				//process result
				if (data.historyValues && data.historyValues.length > 0) {
					var mostRecentMeasurement = genericHelper.getLastItemFrom(data.historyValues);
					this.triggerCapabilityListener('measure_temperature', mostRecentMeasurement.value - kelvinOffset);
				}		
			})
			.catch(error => {
				console.log(error.message, error.stack);
			});
	}
}

module.exports = TemperatureSensorDevice;