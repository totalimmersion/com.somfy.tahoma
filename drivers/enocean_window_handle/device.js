"use strict";

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');

/**
 * Device class for the opening detector with the enocean:EnOceanWindowHandle controllable name in TaHoma
 * @extends {SensorDevice}
 */
class WindowHandleDevice extends SensorDevice {

	onInit() {
		super.onInit();

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
	sync(data) {
		let thisId = this.getData().id;
		const device = data.find(device => device.oid === thisId);

		if (!device) {
			this.setUnavailable(null);
			return;
		}

		if (device.states) {
			const contactState = device.states.find(state => state.name === 'core:ThreeWayHandleDirectionState');
			if (contactState) {
				this.log(this.getName(), contactState.value);
				this.triggerCapabilityListener('alarm_contact', contactState.value != 'closed');
			}
		}
	}
}

module.exports = WindowHandleDevice;