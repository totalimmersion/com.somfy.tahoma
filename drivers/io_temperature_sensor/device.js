"use strict";

const Homey = require('homey');
const Device = require('../../lib/Device');
const taHoma = require('../../lib/tahoma');

//Device for a io:TemperatureIOSystemSensor device
class TemperatureSensorDevice extends Device {

	onInit() {
		this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());
	}

	onAdded() {
		this.log('device added');
	}

	onDeleted() {
		this.log('device deleted');
	}
}

module.exports = TemperatureSensorDevice;