"use strict";

class Driver {

	constructor() {
		this._devices = {};
	}

	init(devices_data, callback) {
	    var _self = this;
	    devices_data.forEach(function(device_data){
	        _self.initDevice(device_data);
	    });

	    callback();
	}

	added(device_data, callback) {
		this.initDevice(device_data);
		callback(null, true);
	}

	deleted(device_data, callback) {
		delete this._devices[device_data.id];
		callback(null, true);
	}

	// a helper method to add a device to the devices list
	initDevice(device_data) {
	    this._devices[device_data.id] = {};
	    //this._devices[device_data.id].state = { onoff: true };
	    this._devices[device_data.id].data = device_data;
	}

	// a helper method to get a device from the devices list by it's device_data object
	getDeviceByData(device_data) {
		var device = this._devices[device_data.id];
		if(typeof device === 'undefined') {
			return new Error("invalid_device");
		} else {
			return device;
		}
	}
};

module.exports = Driver;