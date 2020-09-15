'use strict';

const Driver = require('../Driver');

/**
 * Driver class for vertical exterior blinds with the io:VerticalExteriorAwningIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class VerticalExteriorBlindDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:VerticalExteriorAwningIOComponent'];
  }

}

module.exports = VerticalExteriorBlindDriver;
