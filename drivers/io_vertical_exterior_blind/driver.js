"use strict";

var taHoma = require('../../lib/tahoma');

var devices = {};

var windowcoveringsStateMap = {
	up: 'open',
	idle: null,
	down: 'close'
};

var verticalExteriorBlind = {

	init: function( devices_data, callback ) {
	    // when the driver starts, Homey rebooted. Initialise all previously paired devices.
	    devices_data.forEach(function(device_data){
	        initDevice(device_data);
	    });

	    // let Homey know the driver is ready
	    callback();
	},

	added: function(device_data, callback) {
		initDevice(device_data);
		callback(null, true);
	},

	deleted: function(device_data, callback) {
		delete devices[device_data.id];
		callback(null, true);
	},

	pair: function(socket) {
		socket.on('list_devices', function(data, callback) {
			taHoma.setup(function(err, data) {
				if (data && data.devices) {
					var blinds = new Array();
					for (var i=0; i<data.devices.length; i++) {
						var device = data.devices[i];
						if (device.controllableName == 'io:VerticalExteriorAwningIOComponent') {
							var device_data = {
								name: device.label,
								data: {
									id: device.oid,
									deviceURL: device.deviceURL
								}
							};
							blinds.push(device_data);
						}
					}

					console.log(blinds);

					callback(null, blinds);
				}
			});

		});

		socket.on('disconnect', function() {
			console.log("User aborted pairing, or pairing is finished");
		});
	},

	capabilities: {
		windowcoverings_state: {
			get: function(device_data, callback) {
				var state = 10;
				callback(null, state);
			},

			set: function(device_data, state, callback) {
				if (state == 'idle') {
					//to be implemented
				} else {
					var action = {
						name: windowcoveringsStateMap[state],
						parameters: []
					};

					taHoma.executeDeviceAction(device_data.deviceURL, action, function(err, result) {
						var device = getDeviceByData(device_data);
						device.executionId = result.execId;
						console.log('Execution id: ', device.executionId);
						callback(null, state);
					});
				}
			}
		}
	}
};

module.exports = verticalExteriorBlind;

// a helper method to filter vertical exterior blinds from the list of TaHoma devices
function filterForBlinds(devices) {
	var blinds = new Array();

	devices.forEach(function(device) {
		if (device.controllableName == 'io:VerticalExteriorAwningIOComponent') {
			blinds.push(device);
		}
	});

	return blinds;
}

// a helper method to get a device from the devices list by it's device_data object
function getDeviceByData(device_data) {
	var device = devices[ device_data.id ];
	if( typeof device === 'undefined' ) {
		return new Error("invalid_device");
	} else {
		return device;
	}
}

// a helper method to add a device to the devices list
function initDevice(device_data) {
    devices[ device_data.id ] = {};
    devices[ device_data.id ].state = { onoff: true };
    devices[ device_data.id ].data = device_data;
}