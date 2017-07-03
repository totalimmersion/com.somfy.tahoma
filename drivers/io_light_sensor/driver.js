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
					var device = _self.getDeviceByData(device_data);
					callback(null, device.state.measure_luminance);
				}
			}
		}
	}

	pair(socket) {
		socket.on('list_devices', function(data, callback) {
			taHoma.setup(function(err, data) {
				if (data && data.devices) {
					var lightSensors = new Array();
					for (var i=0; i<data.devices.length; i++) {
						var device = data.devices[i];
						if (device.controllableName == 'io:LightIOSystemSensor') {
							var device_data = {
								name: device.label,
								data: {
									id: device.oid,
									deviceURL: device.deviceURL
								}
							};
							lightSensors.push(device_data);
						}
					}

					console.log(lightSensors)
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