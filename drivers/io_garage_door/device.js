"use strict";

const WindowCoveringsDevice = require("../WindowCoveringsDevice");

/**
 * Device class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class GarageDoorIODevice extends WindowCoveringsDevice {
  async onInit() {
    if (this.hasCapability("lock_state")) {
      this.removeCapability("lock_state");
    }

    await super.onInit();

    if (!this.hasCapability("windowcoverings_set")) {
      this.addCapability("windowcoverings_set");
    }

    this.openClosedStateName = 'core:OpenClosedUnknownState';
  }
}

module.exports = GarageDoorIODevice;