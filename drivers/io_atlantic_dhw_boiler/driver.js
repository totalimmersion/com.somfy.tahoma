/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticPassAPCDHWComponent controllable name in TaHoma
 * @extends {Driver}
 */
class PilotWireProgrammerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:AtlanticPassAPCDHWComponent'];
    }

}

module.exports = PilotWireProgrammerDriver;
