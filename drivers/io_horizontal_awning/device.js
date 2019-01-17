'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for horizontal awnings with the io:HorizontalAwningIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class HorizontalAwningDevice extends WindowCoveringsDevice {

  onInit() {
    super.onInit();

    this.windowcoveringsStateMap = {
      up: 'close',
      idle: null,
      down: 'open'
    };
  }
}

module.exports = HorizontalAwningDevice;
