"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');
const taHoma = require('../../lib/tahoma');

var windowcoveringsStateMap = {
	up: 'open',
	idle: null,
	down: 'close'
};

//Driver for a io:VerticalExteriorAwningIOComponent device
class VerticalExteriorBlindDriver extends Driver {

	onInit() {
		this.deviceType = 'io:VerticalExteriorAwningIOComponent';
	}

}

module.exports = VerticalExteriorBlindDriver;