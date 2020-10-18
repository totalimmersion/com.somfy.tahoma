'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class PergolaDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:SimpleBioclimaticPergolaIOComponent'];
  }

}

module.exports = PergolaDriver;
