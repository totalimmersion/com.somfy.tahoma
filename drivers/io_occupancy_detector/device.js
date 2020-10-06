'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the opening detector with the io:SomfymotionIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class OccupancyDetectorDevice extends SensorDevice {

  async onInit() {
    await super.onInit();

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
   */
  async sync() {
    try {
      const states = await super.sync();
      if (states) {
        const contactState = states.find(state => state.name === 'core:OccupancyState');
        if (contactState) {
          Homey.app.logStates(this.getName() + ": core:OccupancyState = " + contactState.value);
          this.log(this.getName(), contactState.value);
          this.triggerCapabilityListener('alarm_motion', contactState.value === 'personInside');
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

module.exports = OccupancyDetectorDevice;