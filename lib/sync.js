"use strict";

const Log = require('homey-log').Log;
const taHoma = require('./tahoma');

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');

	//check for devices that are removed

	//check for sensor states
	var range = 15 * 60 * 1000; //range of 15 minutes
	var to = Date.now();
	var from = to - range;

	var driver = Homey.manager('drivers').getDriver('io_light_sensor');
	if (driver) {
		var sensors = driver.getDevices();
		for(var sensorId in sensors) {
			if (sensors.hasOwnProperty(sensorId)) {
				var sensor = sensors[sensorId];
				taHoma.getDeviceStateHistory(sensor.data.deviceURL, 'core:LuminanceState', from, to, function(err, data) {
					//process result
					if (!err && data && data.historyValues && data.historyValues.length > 0) {
						var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
						driver.capabilities.measure_luminance.set(sensor.data, mostRecentMeasurement.value, function() {});
					}
				});
			}
		}
	}
};