"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

//Driver for a io:VerticalInteriorBlindVeluxIOComponent device
class VeluxInteriorBlindDriver extends Driver {

	onInit() {
		this.deviceType = ['io:VerticalInteriorBlindVeluxIOComponent'];
	}

}

module.exports = VeluxInteriorBlindDriver;