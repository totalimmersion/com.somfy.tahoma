"use strict";

const Homey = require('homey');
const WindowCoveringsDevice = require('../../lib/WindowCoveringsDevice');

//Device for a io:RollerShutterGenericIOComponent device
/**
 * Device class for roller shutters with the iio:RollerShutterGenericIOComponent or io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDevice extends WindowCoveringsDevice {
}

module.exports = RollerShutterDevice;