/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for horizontal awnings with the io:VerticalInteriorBlindGenericIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class HorizontalAwningDevice extends WindowCoveringsDevice {

  async onInit() {
    if (this.hasCapability('lock_state')) {
      this.removeCapability('lock_state').catch(this.error);
    }

    await super.onInit();

    if (!this.hasCapability('quick_open')) {
      this.addCapability('quick_open').catch(this.error);
    }
  }

}

module.exports = HorizontalAwningDevice;
