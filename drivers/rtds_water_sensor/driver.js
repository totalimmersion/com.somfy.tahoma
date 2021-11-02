/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the light sensor with the rtds:RTDSWaterSensor controllable name in TaHoma
 * @extends {Driver}
 */
class WaterSensorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rtds:RTDSWaterSensor'];
    }

}

module.exports = WaterSensorDriver;
