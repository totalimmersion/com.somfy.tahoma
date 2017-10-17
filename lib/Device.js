"use strict";

const Homey = require('homey');

class Device extends Homey.Device {

	onInit() {
	}

	getDeviceUrl() {
		return this.getData().deviceURL;
	}
}

module.exports = Device;