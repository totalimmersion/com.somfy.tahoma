"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');
const taHoma = require('../../lib/tahoma');

//Driver for a io:TemperatureIOSystemSensor device
class TemperatureSensorDriver extends Driver {

	_onPairListDevices(state, data, callback) {

		taHoma.setup(function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data && data.devices) {
				var temperatureSensors = new Array();
				for (var i=0; i<data.devices.length; i++) {
					var device = data.devices[i];
					if (device.controllableName == 'io:TemperatureIOSystemSensor') {
						var device_data = {
							name: device.label,
							data: {
								id: device.oid,
								deviceURL: device.deviceURL,
								label: device.label
							}
						};
						temperatureSensors.push(device_data);
					}
				}

				callback(null, temperatureSensors);
			}
		});	
	}
}

module.exports = TemperatureSensorDriver;