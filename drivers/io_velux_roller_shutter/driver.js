/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for Velus interior blinds with the io:RollerShutterVeluxIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class VeluxRollerShutterDriver extends ioWindowCoveringsDriver {

  async onInit() {
    this.deviceType = ['io:RollerShutterVeluxIOComponent', 'ogp:Shutter'];

    await super.onInit();
  }

}

module.exports = VeluxRollerShutterDriver;
