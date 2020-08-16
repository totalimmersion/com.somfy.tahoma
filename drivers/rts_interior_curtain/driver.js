'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorCurtainDriver extends Driver {

  onInit() {
    this.deviceType = ['rts:DualCurtainRTSComponent'];
  }

}

module.exports = InteriorCurtainDriver;
