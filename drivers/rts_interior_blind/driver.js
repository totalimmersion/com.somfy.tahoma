'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the rts:BlindRTSComponent and rts:RollerShutterRTSComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorBlindDriver extends Driver {

  async onInit() {
    this.deviceType = ['rts:BlindRTSComponent, rts:RollerShutterRTSComponent'];
  }

}

module.exports = InteriorBlindDriver;
