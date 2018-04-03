"use strict";

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ExteriorVenetianBlindDriver extends Driver {

	onInit() {
		this.deviceType = ['io:ExteriorVenetianBlindIOComponent'];
	}

}

module.exports = ExteriorVenetianBlindDriver;