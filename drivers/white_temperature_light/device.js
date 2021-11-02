/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the hue:ColorTemperatureLightBulbHUEComponent or hue:ColorTemperatureLightSpotHUEComponent controllable name in TaHoma
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
