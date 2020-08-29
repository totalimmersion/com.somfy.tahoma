'use strict';
/**
 * Module with device specific helper functions
 * @module DeviceHelper
 * @example
 * const deviceHelper = require('./lib/helper').Device;
 **/


/**
 * Checks if the id argument is the same as the oid property of the device argument
 * @name isSameDevice
 * @function
 * @public
 * @param {string} id - device id
 * @param {Object} device - device object to check the id against
 * @returns {boolean}
 * @example
 * const id = 'abc';
 * const device = {
 *    oid: 'abc'
 * }
 * const result = isSameDevice(id)(device); // result = true
 */
const isSameDevice = id => device => {
  if (id === undefined && device === undefined) return false;
  device = device || {};
  return id === device.oid;
};

/**
 * Calls the sync method of all the device objects in the devices array
 * @name sync
 * @function
 * @public
 * @param {Array} devices - An array with devices on which to call the sync() method
 * @param {Object} data - device data as provided by the TaHoma api
 * @returns {Function}
 * @example
 * const data = {};
 * const devices = [
 *   {
 *      // ... device properties
 *      sync: function(data) {
 *        //...	process data
 *      }
 *   }
 * ];
 * sync(devices)(data);
 */
const sync = devices => {
  if (!Array.isArray(devices)) throw new TypeError('devices is not an array');
  return data => devices.map(device => {try{ device.sync(data) }finally{}});
};

module.exports = {
  isSameDevice,
  sync
};
