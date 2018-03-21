"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');

/**
 * Driver class for roller shutters with the io:RollerShutterGenericIOComponent or io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class RollerShutterDriver extends Driver {

	onInit() {
		this.deviceType = ['io:RollerShutterGenericIOComponent', 'io:RollerShutterWithLowSpeedManagementIOComponent'];
	}

}

module.exports = RollerShutterDriver;