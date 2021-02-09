'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:SomfyOccupancyIOSystemSensor and rtds:RTDSMotionSensor controllable name in TaHoma
 * @extends {Driver}
 */
class MotionDetectorDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:SomfyOccupancyIOSystemSensor', 'rtds:RTDSMotionSensor', 'zwave:ZWaveNotificationMotionSensor'];

    /*** MOTION TRIGGERS ***/
    this._triggerMotionChange = new Homey.FlowCardTriggerDevice('motion_has_changed').register();
    this._triggerMotionChange.registerRunListener(() => {
      return Promise.resolve(true);
    });
  }


  triggerFlows(device, capability, value)
  {
      const tokens = {
          'isMotion': value
      };

      const state = {
          'alarm_motion': value
      };

      this.triggerFlow(this._triggerMotionChange, device, tokens, state);
  }
}

module.exports = MotionDetectorDriver;
