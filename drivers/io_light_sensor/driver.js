"use strict";

const Driver = require('../../lib/Driver');
var taHoma = require('../../lib/tahoma');

//Driver for a io:LightIOSystemSensor device
class LightSensor extends Driver {

	constructor() {
		super();
		var _self = this;

		this.capabilities = {
			measure_luminance: {
				get: function(device_data, callback) {
					//retrieve luminance
					try {
						var device = _self.getDeviceByData(device_data);
						callback(null, device.state.measure_luminance);
					} catch(e) {
						console.log(e.message);
						callback(e);
					}
				},

				set: function(device_data, luminance, callback) {
					var sensor = _self.getDeviceByData(device_data);
					if(sensor instanceof Error) {
						return callback(sensor);
					}

					var oldLuminance = sensor.state.measure_luminance;
					sensor.state.measure_luminance = luminance;
					if (oldLuminance != sensor.state.measure_luminance) {
						module.exports.realtime(device_data, 'measure_luminance', sensor.state.measure_luminance);

						var tokens = {
							'luminance': sensor.state.measure_luminance
						};

						var state  = {
							'measure_luminance': sensor.state.measure_luminance
						}

						//trigger flows
						Homey.manager('flow').triggerDevice('change_luminance_more_than', tokens, state, device_data, function(err, result) {
							console.log('triggerDevice', 'change_luminance_more_than');
							if (err) {
								return Homey.error(err);
							}
						});

						Homey.manager('flow').triggerDevice('change_luminance_less_than', tokens, state, device_data, function(err, result) {
							console.log('triggerDevice', 'change_luminance_less_than');
							if (err) {
								return Homey.error(err);
							}
						});

						Homey.manager('flow').triggerDevice('change_luminance_between', tokens, state, device_data, function(err, result) {
							console.log('triggerDevice', 'change_luminance_between');
							if (err) {
								return Homey.error(err);
							}
						});
					}

					callback(null, sensor.state.measure_luminance);
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

		});

		socket.on('disconnect', function() {
			console.log("User aborted pairing, or pairing is finished");
		});
	}
}

module.exports = new LightSensor();