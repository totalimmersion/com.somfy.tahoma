/*jslint node: true */
'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the rts:BlindRTSComponent, rts:RollerShutterRTSComponent and rts:ExteriorBlindRTSComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorBlindDriver extends Driver {

  async onInit() {
    this.deviceType = ['rts:BlindRTSComponent', 'rts:RollerShutterRTSComponent', 'rts:ExteriorBlindRTSComponent', 'rts:HorizontalAwningRTSComponent'];
  }

}

module.exports = InteriorBlindDriver;
