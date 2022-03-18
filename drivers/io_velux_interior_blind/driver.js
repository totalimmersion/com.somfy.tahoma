/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for Velus interior blinds with the io:VerticalInteriorBlindVeluxIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class VeluxInteriorBlindDriver extends ioWindowCoveringsDriver {

  async onInit() {
    this.deviceType = ['io:VerticalInteriorBlindVeluxIOComponent', 'ogp:Blind'];

    await super.onInit();
  }

}

module.exports = VeluxInteriorBlindDriver;
