"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');
const taHoma = require('../../lib/tahoma');

//Driver for a io:LightIOSystemSensor device
class LightSensorDriver extends Driver {

	onInit() {
		/*** LUMINANCE TRIGGERS ***/
		new Homey.FlowCardTrigger('change_luminance_more_than')
			.register()
			.registerRunListener((args, state) => {
				let conditionMet = state.measure_luminance < args.luminance;
				return Promise.resolve(conditionMet);
			});

		new Homey.FlowCardTrigger('change_luminance_less_than')
			.register()
			.registerRunListener((args, state) => {
				let conditionMet = state.measure_luminance < args.luminance;
				return Promise.resolve(conditionMet);
			});

		new Homey.FlowCardTrigger('change_luminance_between')
			.register()
			.registerRunListener((args, state) => {
				let conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
				return Promise.resolve(conditionMet);
			});

		/*** LUMINANCE CONDITIONS ***/
		new Homey.FlowCardCondition('has_luminance_more_than')
			.register()
			.registerRunListener((args, state) => {
				let conditionMet = state.measure_luminance > args.luminance;
				return Promise.resolve(conditionMet);
			});

		new Homey.FlowCardCondition('has_luminance_less_than')
			.register()
			.registerRunListener((args, state) => {
				let conditionMet = state.measure_luminance < args.luminance;
				return Promise.resolve(conditionMet);
			});

		new Homey.FlowCardCondition('has_luminance_between')
			.register()
			.registerRunListener((args, state) => {
				let conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
				return Promise.resolve(conditionMet);
			});
	}

	_onPairListDevices(state, data, callback) {

		taHoma.setup(function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data && data.devices) {
				var lightSensors = new Array();
				for (var i=0; i<data.devices.length; i++) {
					var device = data.devices[i];
					if (device.controllableName == 'io:LightIOSystemSensor') {
						var device_data = {
							name: device.label,
							data: {
								id: device.oid,
								deviceURL: device.deviceURL,
								label: device.label
							}
						};
						lightSensors.push(device_data);
					}
				}

				callback(null, lightSensors);
			}
		});

	}
}

module.exports = LightSensorDriver;