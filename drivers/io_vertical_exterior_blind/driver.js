'use strict';

const Driver = require('../Driver');

/**
 * Driver class for vertical exterior blinds with the io:VerticalExteriorAwningIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class VerticalExteriorBlindDriver extends Driver {

  onInit() {
    this.deviceType = ['io:VerticalExteriorAwningIOComponent',
      'io:AwningValanceIOComponent'];
  }

}

module.exports = VerticalExteriorBlindDriver;
