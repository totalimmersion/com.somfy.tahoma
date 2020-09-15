'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ExteriorVenetianBlindDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:ExteriorVenetianBlindIOComponent'];
  }

}

module.exports = ExteriorVenetianBlindDriver;
