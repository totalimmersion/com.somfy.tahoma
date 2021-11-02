/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticDomesticHotWaterProductionV2_AEX_IOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class WaterBoilerProductionDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:AtlanticDomesticHotWaterProductionV2_AEX_IOComponent'];
    }

}

module.exports = WaterBoilerProductionDriver;
