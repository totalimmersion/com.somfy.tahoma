"use strict";

const Homey = require('homey');

/**
 * Base class for devices
 * @extends {Homey.Device}
 */
class Device extends Homey.Device {

	onInit() {
		this.log('Device init:', this.getName(), 'class:', this.getClass());
	}

	onAdded() {
		this.log('device added');
	}

	onDeleted() {
		this.log('device deleted');
	}

	/**
	 * Returns the TaHoma device url
	 * @return {String}
	 */
	getDeviceUrl() {
		return this.getData().deviceURL;
	}

	/**
	 * Returns the io controllable name(s) of TaHoma
	 * @return {Array} deviceType
	 */
	getDeviceType() {
		return this.getDriver().getDeviceType();
	}

	sync() {
		throw new Error('sync() not implemented for device');
	}
}

module.exports = Device;