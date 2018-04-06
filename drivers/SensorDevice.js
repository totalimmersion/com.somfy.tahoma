"use strict";

const Homey = require('homey');
const Device = require('./Device');
const Tahoma = require('../lib/Tahoma');
const deviceHelper = require('../lib/helper').Device;

/**
 * Base class for sensor devices
 * @extends {Device}
 */
class SensorDevice extends Device {

	onInit() {
        this.registerCapabilityListener('alarm_battery', this.onCapabilityAlarmBattery.bind(this));

   		super.onInit();
	}

	onCapabilityAlarmBattery(value, opts) {
		const oldBatteryMeasurement = this.getState().alarm_battery;
		console.log('onCapabilityAlarmBattery', oldBatteryMeasurement, value);
		if (oldBatteryMeasurement != value) {
			const device = this;
			const tokens = {
				'battery': value
			};

			const state  = {
				'alarm_battery': value
			}
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
		
		Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:SensorDefectState', from, to)
			.then(data => {
				//process result
				this.log(data);
				if (data.historyValues && data.historyValues.length > 0) {
					var mostRecentMeasurement = genericHelper.getLastItemFrom(data.historyValues);
					this.triggerCapabilityListener('alarm_battery', mostRecentMeasurement.value);
				}
			})
			.catch(error => {
				console.log(error.message, error.stack);
			});
	}
}

module.exports = SensorDevice;