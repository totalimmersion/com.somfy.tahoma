"use strict";

const Log = require('homey-log').Log;
const taHoma = require('./tahoma');
const kelvinOffset = 273.15;

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');
	var blindDriver = Homey.manager('drivers').getDriver('io_vertical_exterior_blind');
	var lightSensorDriver = Homey.manager('drivers').getDriver('io_light_sensor');
	var temperatureSensorDriver = Homey.manager('drivers').getDriver('io_temperature_sensor');

	//check for sensor states
	var range = 15 * 60 * 1000; //range of 15 minutes
	var to = Date.now();
	var from = to - range;

	//light sensor history
	if (lightSensorDriver) {
		var lightSensors = lightSensorDriver.getDevices();
		for(var sensorId in lightSensors) {
			if (lightSensors.hasOwnProperty(sensorId)) {
				var sensor = lightSensors[sensorId];
				taHoma.getDeviceStateHistory(sensor.data.deviceURL, 'core:LuminanceState', from, to, function(err, data) {
					//process result
					if (!err && data && data.historyValues && data.historyValues.length > 0) {
						var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
						lightSensorDriver.capabilities.measure_luminance.set(sensor.data, mostRecentMeasurement.value, function() {});
					}
				});
			}
		}
	}

	//temperature sensor history
	if (temperatureSensorDriver) {
		var temperatureSensors = temperatureSensorDriver.getDevices();
		for(var sensorId in temperatureSensors) {
			if (temperatureSensors.hasOwnProperty(sensorId)) {
				var sensor = temperatureSensors[sensorId];
				taHoma.getDeviceStateHistory(sensor.data.deviceURL, 'core:TemperatureState', from, to, function(err, data) {
					//process result
					if (!err && data && data.historyValues && data.historyValues.length > 0) {
						var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
						temperatureSensorDriver.capabilities.measure_temperature.set(sensor.data, mostRecentMeasurement.value - kelvinOffset, function() {});
					}
				});
			}
		}
	}

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

			var lightSensors = lightSensorDriver.getDevices();
			var temperatureSensors = temperatureSensorDriver.getDevices();
			var blinds = blindDriver.getDevices();

			for(var blindId in blinds) {
				//check for blinds that are removed
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
					blindDriver.capabilities.windowcoverings_state.set(blind.data, statesMap[openClosedState], function() {}, true);
				}
			}

			//check for light sensors that are removed
			for(var sensorId in lightSensors) {
				if (deviceIds.indexOf(sensorId) == -1) {
					//sensorId no longer exits in TaHoma -> let's remove it;
					lightSensorDriver.removeDevice(sensorId);
				}
			}

			//check for temperature sensors that are removed
			for(var sensorId in temperatureSensors) {
				if (deviceIds.indexOf(sensorId) == -1) {
					//sensorId no longer exits in TaHoma -> let's remove it;
					temperatureSensorDriver.removeDevice(sensorId);
				}
			}
		}
	});
};