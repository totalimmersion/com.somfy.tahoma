"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');
const taHoma = require('../../lib/tahoma');

var windowcoveringsStateMap = {
	up: 'open',
	idle: null,
	down: 'close'
};

//Driver for a io:WindowOpenerVeluxIOComponent device
class RoofWindowDriver extends Driver {

	_onPairListDevices(data, callback) {
		taHoma.setup(function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data && data.devices) {
				var windows = new Array();
				for (var i=0; i<data.devices.length; i++) {
					var device = data.devices[i];
					if (device.controllableName == 'io:WindowOpenerVeluxIOComponent') {
						var device_data = {
							name: device.label,
							data: {
								id: device.oid,
								deviceURL: device.deviceURL,
								label: device.label
							}
						};
						windows.push(device_data);
					}
				}

				callback(null, windows);
			}
		});

	}
}

module.exports = RoofWindowDriver;