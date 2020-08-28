'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class GarageDoorIOdDriver extends Driver {

  onInit() {
    this.deviceType = ['io:GarageOpenerIOComponent'];
  }

}

module.exports = GarageDoorIOdDriver;
