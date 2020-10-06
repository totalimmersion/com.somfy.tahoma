"use strict";

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the opening detector with the enocean:EnOceanWindowHandle controllable name in TaHoma
 * @extends {SensorDevice}
 */
class WindowHandleDevice extends SensorDevice {

	async onInit() {
		await super.onInit();

		this.registerCapabilityListener('alarm_contact', this.onCapabilityAlarmContact.bind(this));
	}

	onCapabilityAlarmContact(value) {
		const oldContactState = this.getState().alarm_contact;
		if (oldContactState !== value) {
			this.setCapabilityValue('alarm_contact', value);

			const device = this;
			const tokens = {
				'isOpen': value
			};

			const state = {
				'alarm_contact': value
			};

			//trigger flows
			return this.getDriver().triggerContactChange(device, tokens, state);
		}

		return Promise.resolve();
	}

	/**
	 * Gets the sensor data from the TaHoma cloud
	 * @param {Array} data - device data from all the devices in the TaHoma cloud
	 */
	async sync() {
		try {
			const states = await super.sync();
			if (states) {
				const contactState = device.states.find(state => state.name === 'core:ThreeWayHandleDirectionState');
				if (contactState) {
					Homey.app.logStates(this.getName() + ": myfox:ThreeWayHandleDirectionState = " + contactState.value);
					this.triggerCapabilityListener('alarm_contact', contactState.value != 'closed');
				}
			}
		} catch (error) {
			this.setUnavailable(null);
			Homey.app.logError(this.getName(), {
				message: error.message,
				stack: error.stack
			});

		}
	}
}

module.exports = WindowHandleDevice;