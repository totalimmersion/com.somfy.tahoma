"use strict";

var taHoma = require('../../lib/tahoma');

var devices = {};

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
		socket.on('start', function( data, callback ) {

			// fire the callback (you can only do this once)
			// ( err, result )
			callback( null, 'Started!' );

			// send a message to the front-end, even after the callback has fired
			setTimeout(function(){
				socket.emit("hello", "Hello to you!", function( err, result ){
					console.log( result ); // result is `Hi!`
				});
			}, 2000);

		});

		socket.on('list_devices', function(data, callback) {
			taHoma.setup(function(err, data) {
				var blinds = filterForBlinds(data.devices);

				var homeyDevices = new Array();

				blinds.forEach(function(blind) {
					var device_data = {
						name: blind.label,
						data: {
							id: blind.oid,
							deviceURL: blind.deviceURL
						}
					};
					homeyDevices.push(device_data);
				});

				console.log(homeyDevices);

				callback(null, homeyDevices);
			});

		});

		socket.on('disconnect', function() {
			console.log("User aborted pairing, or pairing is finished");
		});
	},

	capabilities: {
		onoff: {
			get: function(device_data, callback) {
				callback(null, true);
			},

			set: function(device_data, onoff, callback) {
				callback(null, true);
			}
		},

		windowcoverings_state: {
			get: function(device_data, callback) {
				var state = 10;
				callback(null, state);
			},

			set: function(device_data, state, callback) {
				var state = 25;
				callback(null, state);
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