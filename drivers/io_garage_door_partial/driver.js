'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:DiscreteGarageOpenerWithPartialPositionIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class GarageDoorPartialIOdDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:DiscreteGarageOpenerWithPartialPositionIOComponent'];
  }

}

module.exports = GarageDoorPartialIOdDriver;
