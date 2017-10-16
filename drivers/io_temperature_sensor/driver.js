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

	/*constructor() {
		super();
		var _self = this;

		this.capabilities = {
			measure_temperature: {
				get: function(device_data, callback) {
					//retrieve temperature
					try {
						var device = _self.getDeviceByData(device_data);
						callback(null, device.state.measure_temperature);
					} catch(e) {
						console.log(e.message);
						callback(e);
					}
				},

				set: function(device_data, temperature, callback) {
					var sensor = _self.getDeviceByData(device_data);
					if(sensor instanceof Error) {
						return callback(sensor);
					}

					var oldTemperature = sensor.state.measure_temperature;
					sensor.state.measure_temperature = temperature;
					if (oldTemperature != sensor.state.measure_temperature) {
						module.exports.realtime(device_data, 'measure_temperature', sensor.state.measure_temperature);

						var tokens = {
							'temperature': sensor.state.measure_temperature
						};

						var state  = {
							'measure_temperature': sensor.state.measure_temperature
						}

						//trigger flows
						Homey.manager('flow').triggerDevice('change_temperature_more_than', tokens, state, device_data, function(err, result) {
							if (err) {
								return Homey.error(err);
							}
						});

						Homey.manager('flow').triggerDevice('change_temperature_less_than', tokens, state, device_data, function(err, result) {
							if (err) {
								return Homey.error(err);
							}
						});

						Homey.manager('flow').triggerDevice('change_temperature_between', tokens, state, device_data, function(err, result) {
							if (err) {
								return Homey.error(err);
							}
						});
					}

					callback(null, sensor.state.measure_temperature);
				}
			}
		}
	}

	pair(socket) {
		socket.on('list_devices', function(data, callback) {
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

		});

		socket.on('disconnect', function() {
			console.log("User aborted pairing, or pairing is finished");
		});
	}*/

}

module.exports = TemperatureSensorDriver;