'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const deviceHelper = require('../../lib/helper').Device;

/**
 * Device class for the opening detector with the io:SomfymotionIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class OccupancyDetectorDevice extends SensorDevice {

  onInit() {
    super.onInit();

    this.registerCapabilityListener('alarm_motion', this.onCapabilityAlarmMotion.bind(this));
  }

  onCapabilityAlarmMotion(value) {
    const oldMotionState = this.getState().alarm_motion;
    if (oldMotionState !== value) {
      this.setCapabilityValue('alarm_motion', value);

      const device = this;
      const tokens = {
        'isMotion': value
      };

      const state  = {
        'alarm_motion': value
      };

      //trigger flows
      this.getDriver()
        .triggerMotionChange(device, tokens, state);
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

    Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:OccupancyState', from, to)
      .then(data => {
        //process result
        if (data.historyValues && data.historyValues.length > 0) {
          const { value } = genericHelper.getLastItemFrom(data.historyValues);
          this.triggerCapabilityListener('alarm_motion', value === 'personInside');
        }
      })
      .catch(error => {
        console.log(error.message, error.stack);
      });
  }
}

module.exports = OccupancyDetectorDevice;
