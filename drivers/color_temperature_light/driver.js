/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the hue:GenericExtendedColorLightHUEComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ColorTemperatureLightControllerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['hue:GenericExtendedColorLightHUEComponent', 'hue:ExtendedColorLightCandleHUEComponent', 'hue:LightStripsPlusHUEComponent', 'hue:BloomHUEComponent', 'hue:HueSpotHUEComponent', 'hue:HueLampHUEComponent', 'hue:GenericColorTemperatureLightHUEComponent'];
        await super.onInit();
    }

}

module.exports = ColorTemperatureLightControllerDriver;
