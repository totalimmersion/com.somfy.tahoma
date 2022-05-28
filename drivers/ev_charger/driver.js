/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the eliot:ElectricVehicleChargerComponent controllable name in TaHoma
 * @extends {Driver}
 */
class evChargerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['eliot:ElectricVehicleChargerComponent'];
        await super.onInit();
    }

}

module.exports = evChargerDriver;
