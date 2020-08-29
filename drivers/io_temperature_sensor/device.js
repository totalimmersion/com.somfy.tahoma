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

      const state = {
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

    if (device.states) {
      const temperatureState = device.states.find(state => state.name === 'core:TemperatureState');
      if (temperatureState) {
        this.log(this.getName(), temperatureState.value);
        this.triggerCapabilityListener('measure_temperature', temperatureState.value);
      }
    }
  }
}

module.exports = TemperatureSensorDevice;