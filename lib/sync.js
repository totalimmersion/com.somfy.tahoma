"use strict";

const Homey = require('homey');
const Log = require('homey-log').Log;
const taHoma = require('./tahoma');

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');
	var blindDriver = Homey.ManagerDrivers.getDriver('io_vertical_exterior_blind');
	var lightSensorDriver = Homey.ManagerDrivers.getDriver('io_light_sensor');
	var temperatureSensorDriver = Homey.ManagerDrivers.getDriver('io_temperature_sensor');

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

	/* NEW FROM HERE */
	let drivers = Homey.ManagerDrivers.getDrivers();
	for(let driverId in drivers) {
		let driver = drivers[driverId];
		let devices = driver.getDevices();
		for (let deviceId in devices) {
			let device = devices[deviceId];
			try {
				device.sync();
			} catch(e) {
				console.log(e.message, e.stack);
			}
		}
	}
};