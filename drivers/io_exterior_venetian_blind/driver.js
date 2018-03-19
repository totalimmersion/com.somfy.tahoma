"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

//Driver for a io:ExteriorVenetianBlindIOComponent device
class ExteriorVenetianBlindDriver extends Driver {

	onInit() {
		this.deviceType = ['io:ExteriorVenetianBlindIOComponent'];
	}

}

module.exports = ExteriorVenetianBlindDriver;