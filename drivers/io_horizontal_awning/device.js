'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for horizontal awnings with the io:HorizontalAwningIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class HorizontalAwningDevice extends WindowCoveringsDevice {

  async onInit() {
    if (!this.hasCapability("lock_state")) {
      this.addCapability("lock_state");
    }

    await super.onInit();

    if (!this.hasCapability("quick_open")) {
      this.addCapability("quick_open");
    }

    let dd = this.getData();

    if (!dd.controllableName || dd.controllableName.toLowersCase() !== 'io:awningvalanceiocomponent') {
      // From Anders pull request
      this.setPositionActionName = 'setPosition';
      this.positionStateName = 'core:DeploymentState';
    }
  }
}

module.exports = HorizontalAwningDevice;