"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

//Driver for a io:RollerShutterGenericIOComponent device
class RollerShutterDriver extends Driver {

	onInit() {
		this.deviceType = 'io:RollerShutterGenericIOComponent';
	}

}

module.exports = RollerShutterDriver;