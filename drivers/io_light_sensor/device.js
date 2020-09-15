'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');

/**
 * Device class for the light sensor with the io:LightIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class LightSensorDevice extends SensorDevice {

  async onInit() {
    this.registerCapabilityListener('measure_luminance', this.onCapabilityMeasureLuminance.bind(this));

    super.onInit();
  }

  onCapabilityMeasureLuminance(value) {
    const oldLuminance = this.getState().measure_luminance;
    if (oldLuminance !== value) {
      this.setCapabilityValue('measure_luminance', value);

      const device = this;
      const tokens = {
        'luminance': value
      };

      const state = {
        'measure_luminance': value
      };

      //trigger flows
      this.getDriver()
        .triggerLuminanceMoreThan(device, tokens, state)
        .triggerLuminanceLessThan(device, tokens, state)
        .triggerLuminanceBetween(device, tokens, state);
    }

    return Promise.resolve();
  }

  /**
   * Gets the sensor data from the TaHoma cloud
   * @param {Array} data - device data from all the devices in the TaHoma cloud
   */
  async sync(data) {
    let thisId = this.getData().id;
    const device = data.find(device => device.oid === thisId);
    if (!device) {
      this.setUnavailable(null);
      return;
    }

    if (device.states) {
      const luminance = device.states.find(state => state.name === 'core:LuminanceState');
      if (luminance) {
        this.log(this.getName(), luminance.value);
        const oldLuminance = this.getState().measure_luminance;
        if (oldLuminance !== luminance.value) {
            this.triggerCapabilityListener('measure_luminance', luminance.value);
        }
      }
    }
  }
}

module.exports = LightSensorDevice;