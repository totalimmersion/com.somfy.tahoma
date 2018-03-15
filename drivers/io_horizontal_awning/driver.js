"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

//Driver for a io:HorizontalAwningIOComponent device
class HorizontalAwningDriver extends Driver {

	onInit() {
		this.deviceType = 'io:HorizontalAwningIOComponent';
	}

}

module.exports = HorizontalAwningDriver;
