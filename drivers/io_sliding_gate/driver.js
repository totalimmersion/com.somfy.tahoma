/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for exterior venetian blinds with the io:SlidingDiscreteGateOpenerIOComponent and "io:DiscreteGateOpenerIOComponent" controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class SlidingGateDriver extends ioWindowCoveringsDriver {

  async onInit() {
    this.deviceType = ['io:SlidingDiscreteGateOpenerIOComponent', 'io:DiscreteGateOpenerIOComponent'];

      this.pedestrian_changedTrigger = this.homey.flow.getDeviceTriggerCard('pedestrian_changed');

    await super.onInit();
  }

  triggerPedestrianChange(device, tokens, state)
  {
      this.triggerFlow(this.pedestrian_changedTrigger, device, tokens, state);
      return this;
  }

}

module.exports = SlidingGateDriver;
