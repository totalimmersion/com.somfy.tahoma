"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const taHoma = require('../../lib/tahoma');

//Device for a io:LightIOSystemSensor device
class LightSensorDevice extends Device {

	onInit() {
		this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this.registerCapabilityListener('measure_luminance', this.onCapabilityMeasureLuminance.bind(this));
	}

	onAdded() {
		this.log('device added');
	}

	onDeleted() {
		this.log('device deleted');
	}

	onCapabilityMeasureLuminance(value, opts, callback) {
		var deviceData = this.getData();

		var oldLuminance = this.getState().measure_luminance;
		if (oldLuminance != value) {
			this.setCapabilityValue('measure_luminance', value);
			module.exports.realtime(deviceData, 'measure_luminance', value);

			var tokens = {
				'luminance': value
			};

			var state  = {
				'measure_luminance': value
			}

			//trigger flows
			new Homey.FlowCardTrigger('change_luminance_more_than')
				.register()
				.trigger(tokens, state)
				.catch(this.error)
				.then(this.log);

			new Homey.FlowCardTrigger('change_luminance_less_than')
				.register()
				.trigger(tokens, state)
				.catch(this.error)
				.then(this.log);

			new Homey.FlowCardTrigger('change_luminance_between')
				.register()
				.trigger(tokens, state)
				.catch(this.error)
				.then(this.log);

			/*Homey.manager('flow').triggerDevice('change_luminance_more_than', tokens, state, device_data, function(err, result) {
				if (err) {
					return Homey.error(err);
				}
			});

			Homey.manager('flow').triggerDevice('change_luminance_less_than', tokens, state, device_data, function(err, result) {
				if (err) {
					return Homey.error(err);
				}
			});

			Homey.manager('flow').triggerDevice('change_luminance_between', tokens, state, device_data, function(err, result) {
				if (err) {
					return Homey.error(err);
				}
			});*/
		}

		callback(null, value);
	}
}

module.exports = LightSensorDevice;