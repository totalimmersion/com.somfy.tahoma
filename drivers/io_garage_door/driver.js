/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for exterior venetian blinds with the io:GarageOpenerIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class GarageDoorIOdDriver extends ioWindowCoveringsDriver {

  async onInit() {
    this.deviceType = ['io:GarageOpenerIOComponent'];

    await super.onInit();
  }

}

module.exports = GarageDoorIOdDriver;
