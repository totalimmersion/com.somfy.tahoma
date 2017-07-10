"use strict";

const Log = require('homey-log').Log;
const taHoma = require('./tahoma');

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');
	var blindDriver = Homey.manager('drivers').getDriver('io_vertical_exterior_blind');
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
			return;
		}
		if (data && data.devices) {
			var deviceIds = new Array();
			var devices = {};

			for (var i=0; i<data.devices.length; i++) {
				var device = data.devices[i];
				deviceIds.push(device.oid);
				devices[device.oid] = device;
			}

			var sensors = sensorDriver.getDevices();
			var blinds = blindDriver.getDevices();

			for(var blindId in blinds) {
				if (deviceIds.indexOf(blindId) == -1) {
					//blindId no longer exits in TaHoma -> let's remove it;
					blindDriver.removeDevice(blindId);
				} else {
					//blindId still exists -> let's sync the state of the blind
					var blind = blinds[blindId];
					var states = devices[blindId].states;
					var closureState;
					var openClosedState;

					var statesMap = {
						open: 'up',
						closed: 'down'
					}
					for (var i=0; i<states.length; i++) {
						if (states[i].name == 'core:ClosureState') {
							closureState = states[i].value;
						}
						if (states[i].name == 'core:OpenClosedState') {
							openClosedState = states[i].value;
						}
					}
					blindDriver.capabilities.windowcoverings_state.set(blind.data, statesMap[openClosedState], function() {});
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