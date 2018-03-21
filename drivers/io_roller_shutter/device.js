"use strict";

const Homey = require('homey');
const WindowCoveringsDevice = require('../../lib/WindowCoveringsDevice');

/**
 * Device class for roller shutters with the io:RollerShutterGenericIOComponent or io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDevice extends WindowCoveringsDevice {
}

module.exports = RollerShutterDevice;