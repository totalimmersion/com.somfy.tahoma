"use strict";

const Homey = require('homey');
const Log = require('homey-log').Log;
const Tahoma = require('./Tahoma');

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

var syncWithCloud = function() {
	console.log('sync with cloud');

	Tahoma.setup()
		.then(data => {
			if (data.devices) {
				let drivers = Homey.ManagerDrivers.getDrivers();
				for(let driverId in drivers) {
					let driver = drivers[driverId];
					let devices = driver.getDevices();
					for (let deviceId in devices) {
						let device = devices[deviceId];
						try {
							device.sync(data.devices);
						} catch(e) {
							console.log(e.stack);
						}
					}
				}
			}			
		})
		.catch(error => {
			console.log(error.message, error.stack);
		});
};