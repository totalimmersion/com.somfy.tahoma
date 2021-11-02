/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the rts:DualCurtainRTSComponent, rts:CurtainRTSComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorCurtainDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:DualCurtainRTSComponent', 'rts:CurtainRTSComponent'];
    }

}

module.exports = InteriorCurtainDriver;
