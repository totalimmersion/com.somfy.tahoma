/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:DomesticHotWaterTankComponent controllable name in TaHoma
 * @extends {Driver}
 */
class WaterTankDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:DomesticHotWaterTankComponent'];
    }

}

module.exports = WaterTankDriver;
