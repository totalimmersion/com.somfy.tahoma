"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const taHoma = require('../../lib/tahoma');

//Device for a io:TemperatureIOSystemSensor device
class TemperatureSensorDevice extends Device {

	onInit() {
		this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasureTemperature.bind(this));
	}

	onAdded() {
		this.log('device added');
	}

	onDeleted() {
		this.log('device deleted');
	}

	onCapabilityMeasureTemperature(value, opts) {
		var deviceData = this.getData();

		var oldTemperature = this.getState().measure_temperature;
		if (oldTemperature != value) {
			this.setCapabilityValue('measure_temperature', value);

			var tokens = {
				'temperature': value
			};

			var state  = {
				'measure_temperature': value
			}

			//trigger flows
			new Homey.FlowCardTrigger('change_temperature_more_than')
				.register()
				.trigger(tokens, state)
				.catch(this.error)
				.then(this.log);

			new Homey.FlowCardTrigger('change_temperature_less_than')
				.register()
				.trigger(tokens, state)
				.catch(this.error)
				.then(this.log);

			new Homey.FlowCardTrigger('change_temperature_between')
				.register()
				.trigger(tokens, state)
				.catch(this.error)
				.then(this.log);
		}

		return Promise.resolve();
	}
}

module.exports = TemperatureSensorDevice;