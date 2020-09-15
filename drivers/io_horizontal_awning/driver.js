'use strict';

const Driver = require('../Driver');

/**
 * Driver class for horizontal awnings with the io:HorizontalAwningIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HorizontalAwningDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:HorizontalAwningIOComponent', 'io:AwningValanceIOComponent'];
  }

}

module.exports = HorizontalAwningDriver;