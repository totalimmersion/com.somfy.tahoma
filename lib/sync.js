'use strict';

const Homey = require('homey');
const Tahoma = require('./Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const driverHelper = require('../../lib/helper').Driver;

const syncWithCloud = (interval) => {

    Tahoma.setup()
        .then(data => {
            if (data.devices) {

                Homey.app.logDevices(data.devices);

                try {
                    driverHelper.syncAll(Homey.ManagerDrivers.getDrivers())(data.devices);
                } catch (error) {
                    console.log(error.message, error.stack);
                }
            }
        })
        .catch(error => {
            console.log(error.message, error.stack);
        });
};

let intervalId = null;

module.exports.init = (interval) => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => syncWithCloud(interval), interval);
};
