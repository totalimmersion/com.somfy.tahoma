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
};

module.exports = Driver;