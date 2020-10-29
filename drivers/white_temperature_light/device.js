'use strict';

const LightControllerDevice = require('../LightControllerDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the light controller with the io_dimmable_light controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class WhiteTemperatureLightControllerDevice extends LightControllerDevice
{
    async onInit()
    {
        await super.onInit();
    }

}

module.exports = WhiteTemperatureLightControllerDevice;