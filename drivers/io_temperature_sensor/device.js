'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the temperature sensor with the io:TemperatureIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class TemperatureSensorDevice extends SensorDevice {

  async onInit() {
    await super.onInit();

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
   */
  async sync() {
    try {
      const states = await super.sync();
      if (states) {
        const temperatureState = states.find(state => state.name === 'core:TemperatureState');
        if (temperatureState) {
          Homey.app.logStates(this.getName() + ": core:TemperatureState = " + temperatureState.value);
          this.triggerCapabilityListener('measure_temperature', temperatureState.value);
        }
      }
    } catch (error) {
      this.setUnavailable(null);
      Homey.app.logInformation(this.getName(), {
        message: error.message,
        stack: error.stack
      });

    }
  }

	// look for updates in the events array
	async syncEvents(events) {
		const myURL = this.getDeviceUrl();

		// Process events sequentially so they are in the correct order
		for (var i = 0; i < events.length; i++) {
			const element = events[i];
			if (element['name'] === 'DeviceStateChangedEvent') {
				if ((element['deviceURL'] === myURL) && element['deviceStates']) {
					// Got what we need to update the device so lets find it
					for (var x = 0; x < element.deviceStates.length; x++) {
						const deviceState = element.deviceStates[x];
						if (deviceState.name === 'core:TemperatureState') {
							Homey.app.logStates(this.getName() + ": core:TemperatureState = " + deviceState.value);
							const oldState = this.getState().measure_temperature;
							if (oldState !== deviceState.value) {
								this.triggerCapabilityListener('measure_temperature', Number(deviceState.value));
							}
						}
					}
				}
			}
		}
	}
}

module.exports = TemperatureSensorDevice;