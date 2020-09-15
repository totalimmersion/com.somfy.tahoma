'use strict';

const Driver = require('../Driver');

/**
 * Driver class for Velux roof windows with the io:WindowOpenerVeluxIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class RoofWindowDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:WindowOpenerVeluxIOComponent'];
  }

}

module.exports = RoofWindowDriver;
