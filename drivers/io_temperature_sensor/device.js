"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const Tahoma = require('../../lib/Tahoma');

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
		const kelvinOffset = 273.15;
		
		Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:TemperatureState', from, to)
			.then(data => {
				//process result
				if (data.historyValues && data.historyValues.length > 0) {
					var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
					this.triggerCapabilityListener('measure_temperature', mostRecentMeasurement.value - kelvinOffset);
				}		
			})
			.catch(error => {
				console.log(error.message, error.stack);
			});
	}
}

module.exports = TemperatureSensorDevice;