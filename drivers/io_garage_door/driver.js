'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:GarageOpenerIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class GarageDoorIOdDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:GarageOpenerIOComponent'];
  }

}

module.exports = GarageDoorIOdDriver;
