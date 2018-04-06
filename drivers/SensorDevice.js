"use strict";

const Homey = require('homey');
const Device = require('./Device');
const Tahoma = require('../lib/Tahoma');
const deviceHelper = require('../lib/helper').Device;

/**
 * Base class for sensor devices
 * @extends {Device}
 */
class SensorDevice extends Device {
}

module.exports = SensorDevice;