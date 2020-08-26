'use strict';

const Driver = require('../Driver');

/**
 * Driver class for roller shutters with the io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class RollerShutterQuietDriver extends Driver {

  onInit() {
    this.deviceType = [
      'io:RollerShutterWithLowSpeedManagementIOComponent'
    ];
  }
}

module.exports = RollerShutterQuietDriver;
