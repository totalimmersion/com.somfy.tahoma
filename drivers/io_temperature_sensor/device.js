"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const taHoma = require('../../lib/tahoma');

//Device for a io:TemperatureIOSystemSensor device
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
}

module.exports = TemperatureSensorDevice;