/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the rts:BlindRTSComponent, rts:RollerShutterRTSComponent and rts:ExteriorBlindRTSComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HorizontalAwningRTSDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:HorizontalAwningRTSComponent'];
    }

}

module.exports = HorizontalAwningRTSDriver;
