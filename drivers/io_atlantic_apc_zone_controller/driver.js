/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticPassAPCZoneControlMainComponent controllable name in TaHoma
 * @extends {Driver}
 */
class AtlanticZoneControllerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:AtlanticPassAPCZoneControlMainComponent'];
    }

}

module.exports = AtlanticZoneControllerDriver;
