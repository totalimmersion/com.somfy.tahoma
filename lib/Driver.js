"use strict";

const Homey = require('homey');

class Driver extends Homey.Driver {

	onPair(socket) {

		socket
			.on('list_devices', (data, callback) => {
				if (this._onPairListDevices) {
					this._onPairListDevices(data, callback);
				} else {
					callback(new Error('missing _onPairListDevices'));
				}
			})
			.on('disconnect', () => {
				this.log("User aborted pairing, or pairing is finished");
			});
	}

	triggerFlow(trigger, device, tokens, state) {
		if (trigger) {
			trigger
				.trigger(device, tokens, state)
				.then(this.log)
				.catch(this.error);
		}
	}
};

module.exports = Driver;