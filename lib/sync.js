'use strict';

const Homey = require('homey');
const Log = require('homey-log').Log;
const Tahoma = require('./Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const driverHelper = require('../../lib/helper').Driver;

let intervalId = null;

module.exports.init = (interval) => {
	if (intervalId) {
		clearInterval(intervalId);
	}
	intervalId = setInterval(() => syncWithCloud(interval), interval);
};

const syncWithCloud = (interval) => {
	genericHelper.trace('Sync with cloud with interval')(interval);

	Tahoma.setup()
		.then(data => {
			if (data.devices) {
				try {
					driverHelper.syncAll(Homey.ManagerDrivers.getDrivers())(data.devices);
				} catch(error) {
					console.log(error.message, error.stack);
				}
			}
		})
		.catch(error => {
			console.log(error.message, error.stack);
		});
};
