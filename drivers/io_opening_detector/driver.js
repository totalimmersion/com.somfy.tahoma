'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:SomfyContactIOSystemSensor controllable name in TaHoma
 * @extends {Driver}
 */
class OpeningDetectorDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:SomfyContactIOSystemSensor'];

    /*** CONTACT TRIGGERS ***/
    this._triggerContactChange = new Homey.FlowCardTriggerDevice('contact_has_changed').register();
    this._triggerContactChange.registerRunListener(() => {
      return Promise.resolve(true);
    });
  }

  /**
	 * Triggers the 'contact change' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerContactChange(device, tokens, state) {
    this.triggerFlow(this._triggerContactChange, device, tokens, state);
    return this;
  }
}

module.exports = OpeningDetectorDriver;
