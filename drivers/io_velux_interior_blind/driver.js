'use strict';

const Driver = require('../Driver');

/**
 * Driver class for Velus interior blinds with the io:VerticalInteriorBlindVeluxIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class VeluxInteriorBlindDriver extends Driver {

  onInit() {
    this.deviceType = ['io:VerticalInteriorBlindVeluxIOComponent'];
  }

}

module.exports = VeluxInteriorBlindDriver;
