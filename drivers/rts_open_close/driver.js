/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the rts:GarageDoor4TRTSComponent, rts:SlidingGateOpener4TRTSComponent, io:CyclicGarageOpenerIOComponent, io:CyclicSlidingGateOpenerIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class OpenCloseDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:GarageDoor4TRTSComponent', 'rts:SlidingGateOpener4TRTSComponent', 'io:CyclicGarageOpenerIOComponent', 'io:CyclicSlidingGateOpenerIOComponent'];
    }

}

module.exports = OpenCloseDriver;
