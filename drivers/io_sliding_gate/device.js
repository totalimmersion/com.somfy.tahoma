/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the io:SlidingDiscreteGateOpenerIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class SlidingGateDevice extends WindowCoveringsDevice {

  async onInit() {
    if (this.hasCapability('lock_state')) {
      this.removeCapability('lock_state').catch(this.error);
    }

    this.registerCapabilityListener('pedestrian', this.onCapabilityPedestrian.bind(this));

    await super.onInit();

    this.positionStateName = ''; // Device is not positionable
    this.setPositionActionName = ''; // Device is not positionable

    this.openClosedStateName = 'core:OpenClosedPedestrianState';
    this.myCommand = 'setPedestrianPosition'; // Name of the command to set the My position

    if (this.invertUpDown)
    {
        // Homey capability to Somfy command map
        this.windowcoveringsActions = {
            up: 'close',
            idle: 'stop',
            down: 'open',
        };

        // Somfy state to Homey capability map
        this.windowcoveringsStatesMap = {
            open: 'down',
            closed: 'up',
            pedestrian: 'idle',
        };
    }
    else
    {
        this.windowcoveringsActions = {
            up: 'open',
            idle: 'stop',
            down: 'close',
        };

        this.windowcoveringsStatesMap = {
            open: 'up',
            closed: 'down',
            pedestrian: 'idle',
        };
    }
  }

}

module.exports = SlidingGateDevice;
