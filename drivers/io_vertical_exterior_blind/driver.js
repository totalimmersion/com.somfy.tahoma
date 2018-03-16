"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

//Driver for a io:VerticalExteriorAwningIOComponent device
class VerticalExteriorBlindDriver extends Driver {

	onInit() {
		this.deviceType = ['io:VerticalExteriorAwningIOComponent'];
	}

}

module.exports = VerticalExteriorBlindDriver;