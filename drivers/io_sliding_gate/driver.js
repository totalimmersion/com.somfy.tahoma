/*jslint node: true */
'use strict';

const Homey = require('homey');
const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for exterior venetian blinds with the io:SlidingDiscreteGateOpenerIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class SlidingGateDriver extends ioWindowCoveringsDriver {

  async onInit() {
    this.deviceType = ['io:SlidingDiscreteGateOpenerIOComponent'];

      this.pedestrian_changedTrigger = new Homey.FlowCardTriggerDevice('pedestrian_changed')
    .register();

    await super.onInit();    
  }

  triggerPedestrianChange(device, tokens, state)
  {
      this.triggerFlow(this.pedestrian_changedTrigger, device, tokens, state);
      return this;
  }
}

module.exports = SlidingGateDriver;
