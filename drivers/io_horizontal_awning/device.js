'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for horizontal awnings with the io:HorizontalAwningIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class HorizontalAwningDevice extends WindowCoveringsDevice {

  async onInit() {
    super.onInit();

    if (!this.hasCapability("quick_open")) {
      this.addCapability("quick_open");
    }

    this.windowcoveringsActions = {
      up: 'close',
      idle: null,
      down: 'open'
    };

    this.windowcoveringsStatesMap = {
      open: 'down',
      closed: 'up'
    };

    let dd = this.getData();

    if (!dd.controllableName || dd.controllableName != 'io:AwningValanceIOComponent') {
      // From Anders pull request
      this.setPositionActionName = 'setPosition';
      this.closureStateName = 'core:DeploymentState';
    }
  }
}

module.exports = HorizontalAwningDevice;