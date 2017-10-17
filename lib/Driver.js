"use strict";

const Homey = require('homey');

class Driver extends Homey.Driver {

	onPair(socket) {

		socket
			.on('list_devices', (data, callback) => {
				if (this._onPairListDevices) {
					this._onPairListDevices(state, data, callback);
				} else {
					callback( new Error('missing _onPairListDevices') );
				}
			})
			.on('disconnect', () => {
				console.log("User aborted pairing, or pairing is finished");
			});
	}

	/*constructor() {
		super();
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
	    this._devices[device_data.id].state = {};
	    this._devices[device_data.id].data = device_data;

	    var capabilities = this.getMyCapabilities();
	    for (var i=0; i<capabilities.length; i++) {
	    	var capability = capabilities[i];
	    	this._devices[device_data.id].state[capability] = null;
	    }
	}

	getDevices() {
		return this._devices;
	}

	removeDevice(deviceId) {
		delete this._devices[deviceId];
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

	// a helper method to get the device's capabilities
	getMyCapabilities() {
		var capabilities = new Array();

		if (this.capabilities) {
			for (var capability in this.capabilities) {
				if (this.capabilities.hasOwnProperty(capability)) {
					capabilities.push(capability);
				}
			}
		}

		return capabilities;
	}*/
};

module.exports = Driver;