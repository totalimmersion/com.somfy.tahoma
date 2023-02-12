/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the zigbee:DanfossHeatingFloorComponent controllable name in TaHoma
 * @extends {Driver}
 */
class DanfossIconThermostatDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['zigbee:DanfossHeatingFloorComponent'];
    }

}

module.exports = DanfossIconThermostatDriver;
