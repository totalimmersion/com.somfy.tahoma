/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticElectricalHeaterWithAdjustableTemperatureSetpointIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ElectricHeaterDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:AtlanticElectricalHeaterWithAdjustableTemperatureSetpointIOComponent'];
    }

}

module.exports = ElectricHeaterDriver;
