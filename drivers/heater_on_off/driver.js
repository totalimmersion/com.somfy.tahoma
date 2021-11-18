/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for io:DiscreteExteriorHeatingIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HeaterOnOffDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:DiscreteExteriorHeatingIOComponent'];
    }

}

module.exports = HeaterOnOffDriver;
