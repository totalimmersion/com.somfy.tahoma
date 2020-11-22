'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:SomfyOccupancyIOSystemSensor and rtds:RTDSMotionSensor controllable name in TaHoma
 * @extends {Driver}
 */
class MotionDetectorDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:SomfyOccupancyIOSystemSensor', 'rtds:RTDSMotionSensor'];

    /*** MOTION TRIGGERS ***/
    this._triggerMotionChange = new Homey.FlowCardTriggerDevice('motion_has_changed').register();
    this._triggerMotionChange.registerRunListener(() => {
      return Promise.resolve(true);
    });
  }

  /**
	 * Triggers the 'motion change' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerMotionChange(device, tokens, state) {
    this.triggerFlow(this._triggerMotionChange, device, tokens, state);
    return this;
  }
}

module.exports = MotionDetectorDriver;
