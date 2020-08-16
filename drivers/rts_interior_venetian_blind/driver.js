'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorVenetianBlindDriver extends Driver {

  onInit() {
    this.deviceType = ['rts:VenetianBlindRTSComponent'];
  }

}

module.exports = InteriorVenetianBlindDriver;
