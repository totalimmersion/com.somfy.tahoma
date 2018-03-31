"use strict";

const Homey = require('homey');
const Log = require('homey-log').Log;
const Tahoma = require('./Tahoma');
const helper = require('../../lib/functional');

var interval = 1 * 60 * 1000; //interval of 1 minute

module.exports.init = function() {
	setInterval(syncWithCloud, interval);
};

const getDriversAsArray = (driversObj) => Object.values(driversObj);
const getDevices = drivers => drivers.map(driver => driver.getDevices()).reduce((acc, x) => acc.concat(x) , []);
const sync = devices => data => devices.map(device => device.sync(data));
const syncAll = helper.pipe(getDriversAsArray, getDevices, sync);

const syncWithCloud = function() {
	console.log('sync with cloud');

	Tahoma.setup()
		.then(data => {
			if (data.devices) {
				try {
					syncAll(Homey.ManagerDrivers.getDrivers())(data.devices);
				} catch(error) {
					console.log(error.stack);
				}
			}			
		})
		.catch(error => {
			console.log(error.message, error.stack);
		});
};