"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

/**
 * Driver class for Velus interior blinds with the io:VerticalInteriorBlindVeluxIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class VeluxInteriorBlindDriver extends Driver {

	onInit() {
		this.deviceType = ['io:VerticalInteriorBlindVeluxIOComponent'];
	}

}

module.exports = VeluxInteriorBlindDriver;