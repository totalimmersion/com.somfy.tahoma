"use strict";

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the rts:GarageDoor4TRTSComponent, rts:SlidingGateOpener4TRTSComponent controllable name in TaHoma
 * @extends {Driver}
 */
class OpenCloseDriver extends Driver {

	async onInit() {
		this.deviceType = ['rts:GarageDoor4TRTSComponent', 'rts:SlidingGateOpener4TRTSComponent'];

	}

}

module.exports = OpenCloseDriver;
