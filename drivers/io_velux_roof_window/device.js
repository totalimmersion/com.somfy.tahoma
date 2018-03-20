"use strict";

const Homey = require('homey');
const WindowCoveringsDevice = require('../../lib/WindowCoveringsDevice');

//Device for a io:WindowOpenerVeluxIOComponent device
/**
 * Device class for Velux roof windows with the io:WindowOpenerVeluxIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RoofWindowDevice extends WindowCoveringsDevice {
}

module.exports = RoofWindowDevice;