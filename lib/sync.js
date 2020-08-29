'use strict';

const Homey = require('homey');
const Tahoma = require('./Tahoma');

const syncWithCloud = (interval) => {

    Tahoma.setup()
        .then(data => {
            if (data.devices) {

                Homey.app.logDevices(data.devices);

                const drivers = Homey.ManagerDrivers.getDrivers();
                for (const driver in drivers) {
                    Homey.ManagerDrivers.getDriver(driver).getDevices().forEach(device => {
                        try {
                            device.sync(data.devices)
                        } catch (error) {
                            Homey.app.logError("Tahoma.setup", error);
                        }
                    })
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