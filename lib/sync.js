"use strict";

const Log = require('homey-log').Log;
const taHoma = require('./tahoma');

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');
	var screenDriver = Homey.manager('drivers').getDriver('io_vertical_exterior_blind');
	var sensorDriver = Homey.manager('drivers').getDriver('io_light_sensor');

	//check for sensor states
	var range = 15 * 60 * 1000; //range of 15 minutes
	var to = Date.now();
	var from = to - range;

	if (sensorDriver) {
		var sensors = sensorDriver.getDevices();
		for(var sensorId in sensors) {
			if (sensors.hasOwnProperty(sensorId)) {
				var sensor = sensors[sensorId];
				taHoma.getDeviceStateHistory(sensor.data.deviceURL, 'core:LuminanceState', from, to, function(err, data) {
					//process result
					if (!err && data && data.historyValues && data.historyValues.length > 0) {
						var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
						sensorDriver.capabilities.measure_luminance.set(sensor.data, mostRecentMeasurement.value, function() {});
					}
				});
			}
		}
	}

	//check for devices that are removed
	taHoma.setup(function(err, data) {
		if (err) {
			return callback(err);
		}
		if (data && data.devices) {
			var deviceIds = new Array();
			for (var i=0; i<data.devices.length; i++) {
				deviceIds.push(data.devices[i].oid);
			}

			var sensors = sensorDriver.getDevices();
			var screens = screenDriver.getDevices();

			for(var screenId in screens) {
				if (deviceIds.indexOf(screenId) == -1) {
					//screenId no longer exits in TaHoma -> let's remove it;
					screenDriver.removeDevice(screenId);
				}
			}

			for(var sensorId in sensors) {
				if (deviceIds.indexOf(sensorId) == -1) {
					//sensorId no longer exits in TaHoma -> let's remove it;
					sensorDriver.removeDevice(sensorId);
				}
			}
		}
	});
};