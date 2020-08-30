'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');

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

      const state = {
        'alarm_motion': value
      };

      //trigger flows
      this.getDriver().triggerMotionChange(device, tokens, state);
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
      const contactState = device.states.find(state => state.name === 'core:OccupancyState');
      if (contactState) {
        this.log(this.getName(), contactState.value);
        this.triggerCapabilityListener('alarm_motion', contactState.value === 'personInside');
      }
    }
  }
}

module.exports = OccupancyDetectorDevice;