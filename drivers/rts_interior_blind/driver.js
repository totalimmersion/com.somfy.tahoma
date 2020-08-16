'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorBlindDriver extends Driver {

  onInit() {
    this.deviceType = ['rts:BlindRTSComponent'];
  }

}

module.exports = InteriorBlindDriver;
