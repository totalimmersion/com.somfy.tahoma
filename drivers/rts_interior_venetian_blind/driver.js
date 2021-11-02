/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the rts:VenetianBlindRTSComponent and rts:ExteriorVenetianBlindRTSComponent controllable name in TaHoma
 * @extends {Driver}
 */
class InteriorVenetianBlindDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:VenetianBlindRTSComponent', 'rts:ExteriorVenetianBlindRTSComponent'];
    }

}

module.exports = InteriorVenetianBlindDriver;
