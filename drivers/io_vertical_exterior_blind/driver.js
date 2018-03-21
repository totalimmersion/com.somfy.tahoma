"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

/**
 * Driver class for vertical exterior blinds with the io:VerticalExteriorAwningIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class VerticalExteriorBlindDriver extends Driver {

	onInit() {
		this.deviceType = ['io:VerticalExteriorAwningIOComponent'];
	}

}

module.exports = VerticalExteriorBlindDriver;