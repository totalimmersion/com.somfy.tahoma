"use strict";

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
			var device_data = {
				id: "id123",
				name: "Name here"
			};
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