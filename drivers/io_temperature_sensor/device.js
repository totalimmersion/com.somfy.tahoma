'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const genericHelper = require('../../lib/helper').Generic;
const deviceHelper = require('../../lib/helper').Device;

/**
 * Device class for the temperature sensor with the io:TemperatureIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class TemperatureSensorDevice extends SensorDevice {

  onInit() {
    super.onInit();

    this.registerCapabilityListener('measure_temperature', this.onCapabilityMeasureTemperature.bind(this));
  }

  onCapabilityMeasureTemperature(value) {
    const oldTemperature = this.getState().measure_temperature;
    if (oldTemperature !== value) {
      this.setCapabilityValue('measure_temperature', value);

      const device = this;
      const tokens = {
        'temperature': value
      };

      const state  = {
        'measure_temperature': value
      };

      //trigger flows
      this.getDriver()
        .triggerTemperatureMoreThan(device, tokens, state)
        .triggerTemperatureLessThan(device, tokens, state)
        .triggerTemperatureBetween(device, tokens, state);
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

    Tahoma.getDeviceStateHistory(this.getDeviceUrl(), 'core:TemperatureState', from, to)
      .then(data => {
        //process result
        if (data.historyValues && data.historyValues.length > 0) {
          var { value } = genericHelper.getLastItemFrom(data.historyValues);
          this.triggerCapabilityListener('measure_temperature', value);
        }
      })
      .catch(error => {
        console.log(error.message, error.stack);
      });
  }
}

module.exports = TemperatureSensorDevice;
