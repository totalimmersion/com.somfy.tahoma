"use strict";

const Homey = require('homey');
const Log = require('homey-log').Log;
const Tahoma = require('./Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const driverHelper = require('../../lib/helper').Driver;

const INTERVAL = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, INTERVAL);
};

const syncWithCloud = function() {
	genericHelper.trace('Sync with cloud with interval')(INTERVAL);

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