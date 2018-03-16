"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

//Driver for a io:WindowOpenerVeluxIOComponent device
class RoofWindowDriver extends Driver {

	onInit() {
		this.deviceType = ['io:WindowOpenerVeluxIOComponent'];
	}

}

module.exports = RoofWindowDriver;