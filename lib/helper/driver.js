'use strict';

const genericHelper = require('./generic');
const deviceHelper = require('./device');

/**
 * Module with driver specific helper functions
 * @module DriverHelper
 * @example
 * const driverHelper = require('./lib/helper').Driver;
 **/

/**
 * Gets all the devices from the given drivers in a flat array
 * @name getDevices
 * @function
 * @public
 * @param {Array} driver - Array with drivers to get the devices from
 * @returns {Array} devices
 */
const getDevices = drivers => drivers.map(driver => driver.getDevices()).reduce((acc, x) => acc.concat(x) , []);

/**
 * Syncs all the devices from the given drivers by calling sync() on each device
 * @name syncAll
 * @function
 * @public
 * @param {Object} drivers - The drivers as returned from Homey.ManagerDrivers.getDrivers()
 * @param {Array} devices - Array with devices as provided by theTahoma api
 * @returns {Array} devices
 * @example
 * driverHelper.syncAll(Homey.ManagerDrivers.getDrivers())(data.devices);
 */
const syncAll = genericHelper.pipe(genericHelper.objToArray, getDevices, deviceHelper.sync);

module.exports = {
  getDevices,
  syncAll
};
