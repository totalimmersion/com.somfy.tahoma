'use strict';

const Driver = require('../Driver');

/**
 * Driver class for Velus interior blinds with the io:RollerShutterVeluxIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class VeluxRollerShutterDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:RollerShutterVeluxIOComponent'];
  }

}

module.exports = VeluxRollerShutterDriver;
