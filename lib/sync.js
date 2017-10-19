"use strict";

const Homey = require('homey');
const Log = require('homey-log').Log;
const taHoma = require('./tahoma');
const kelvinOffset = 273.15;

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');
	var blindDriver = Homey.ManagerDrivers.getDriver('io_vertical_exterior_blind');
	var lightSensorDriver = Homey.ManagerDrivers.getDriver('io_light_sensor');
	var temperatureSensorDriver = Homey.ManagerDrivers.getDriver('io_temperature_sensor');

	//check for sensor states
	var range = 15 * 60 * 1000; //range of 15 minutes
	var to = Date.now();
	var from = to - range;

	//light sensor history
	if (lightSensorDriver) {
		var lightSensors = lightSensorDriver.getDevices();
		for(var i in lightSensors) {
			var lightSensor = lightSensors[i];
			taHoma.getDeviceStateHistory(lightSensor.getDeviceUrl(), 'core:LuminanceState', from, to)
				.then(data => {
					//process result
					if (data.historyValues && data.historyValues.length > 0) {
						var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
						lightSensor.triggerCapabilityListener('measure_luminance', mostRecentMeasurement.value);
					}
				})
				.catch(error => {
					console.log(error.message, error.stack);
				});
		}
	}

	//temperature sensor history
	if (temperatureSensorDriver) {
		var temperatureSensors = temperatureSensorDriver.getDevices();
		for(var i in temperatureSensors) {
			var temperatureSensor = temperatureSensors[i];
			taHoma.getDeviceStateHistory(temperatureSensor.getDeviceUrl(), 'core:TemperatureState', from, to)
				.then(data => {
					//process result
					if (data.historyValues && data.historyValues.length > 0) {
						var mostRecentMeasurement = data.historyValues[data.historyValues.length - 1];
						temperatureSensor.triggerCapabilityListener('measure_luminance', mostRecentMeasurement.value - kelvinOffset);
					}		
				})
				.catch(error => {
					console.log(error.message, error.stack);
				});
		}
	}

	taHoma.setup()
		.then(data => {
			if (data.devices) {
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

				for(var i in blinds) {
					var blind = blinds[i];
					var blindId = blind.getData().id;

					//check for blinds that are removed
					if (deviceIds.indexOf(blindId) == -1) {
						//blindId no longer exits in TaHoma -> let's remove it;
						blind.setUnavailable(null);
					} else {
						//blindId still exists -> let's sync the state of the blind
						var states = devices[blindId].states;
						var closureState;
						var openClosedState;

						var statesMap = {
							open: 'up',
							closed: 'down'
						};	

						for (var j=0; j<states.length; j++) {
							if (states[j].name == 'core:ClosureState') {
								closureState = states[j].value;
							}
							if (states[j].name == 'core:OpenClosedState') {
								openClosedState = states[j].value;
							}
						}

						blind.triggerCapabilityListener('windowcoverings_state', statesMap[openClosedState], {
							fromCloudSync: true
						});
					}
				}

				//check for light sensors that are removed
				for(var i in lightSensors) {
					let lightSensor = lightSensors[i];

					if (deviceIds.indexOf(lightSensor.getData().id) == -1) {
						//sensorId no longer exits in TaHoma -> let's remove it;
						lightSensor.setUnavailable(null);;
					}
				}

				//check for temperature sensors that are removed
				for(var i in temperatureSensors) {
					let temperatureSensor = temperatureSensors[i];

					if (deviceIds.indexOf(temperatureSensor.getData().id) == -1) {
						//sensorId no longer exits in TaHoma -> let's remove it;
						temperatureSensor.setUnavailable(null);;
					}
				}
			}			
		})
		.catch(error => {
			console.log(error.message, error.stack);
		});
};