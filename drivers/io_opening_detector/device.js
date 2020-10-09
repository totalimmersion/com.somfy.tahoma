'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the opening detector with the io:SomfyContactIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class OpeningDetectorDevice extends SensorDevice {

  async onInit() {
    await super.onInit();

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

      //trigger flows
      this.getDriver()
        .triggerContactChange(device, tokens);
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
        const contactState = states.find(state => state.name === 'core:ContactState');
        if (contactState) {
          Homey.app.logStates(this.getName() + ": core:ContactState = " + contactState.value);
          this.triggerCapabilityListener('alarm_contact', contactState.value === 'open');
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
            if (deviceState.name === 'core:ContactState') {
              Homey.app.logStates(this.getName() + ": core:ContactState = " + deviceState.value);
              const oldState = this.getState().measure_luminance;
              if (oldState !== deviceState.value) {
                this.triggerCapabilityListener('alarm_contact', deviceState.value === 'open');
              }
            }
          }
        }
      }
    }
  }
}

module.exports = OpeningDetectorDevice;