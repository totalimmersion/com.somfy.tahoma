/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticPassAPCHeatingAndCoolingZoneComponent, io:AtlanticPassAPCZoneControlZoneComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HotColdZoneDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:AtlanticPassAPCHeatingAndCoolingZoneComponent', 'io:AtlanticPassAPCZoneControlZoneComponent'];
    }

}

module.exports = HotColdZoneDriver;
