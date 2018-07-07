"use strict";

const Homey = require('homey');
const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const deviceHelper = require('../../lib/helper').Device;

/**
 * Device class for the opening detector with the io:SomfyContactIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class OpeningDetectorDevice extends SensorDevice {

	onInit() {
		super.onInit();

        this.registerCapabilityListener('alarm_contact', this.onCapabilityAlarmContact.bind(this));
	}

	onCapabilityAlarmContact(value, opts) {
		const oldContactState = this.getState().alarm_contact;
		if (oldContactState != value) {
			this.setCapabilityValue('alarm_contact', value);

			const device = this;
			const tokens = {
				'isOpen': value
			};

			const state  = {
				'alarm_contact': value
			}

			//trigger flows
			this.getDriver()
				.triggerContactChange(device, tokens, state)
				.triggerContactOpen(device, tokens, state)
				.triggerContactClosed(device, tokens, state);
		}

		return Promise.resolve();
	}

	/**
	 * Gets the sensor data from the TaHoma cloud
	 * @param {Array} data - device data from all the devices in the TaHoma cloud
	 */
	sync(data) {
		const device = data.find(deviceHelper.isSameDevice(this.getData().id), this);

		if (!device) {
			this.setUnavailable(null);
			return;
		}

		const range = 15 * 60 * 1000; //range of 15 minutes
		const to = Date.now();
		const from = to - range;

		Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:ContactState', from, to)
			.then(data => {
				//process result
				if (data.historyValues && data.historyValues.length > 0) {
					const { value } = genericHelper.getLastItemFrom(data.historyValues);
					this.triggerCapabilityListener('alarm_contact', value == 'open');
				}
			})
			.catch(error => {
				console.log(error.message, error.stack);
			});
	}
}

module.exports = OpeningDetectorDevice;
