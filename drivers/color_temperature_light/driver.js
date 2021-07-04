/*jslint node: true */
'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the hue:GenericExtendedColorLightHUEComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ColorTemperatureLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'hue:GenericExtendedColorLightHUEComponent', 'hue:ExtendedColorLightCandleHUEComponent', 'hue:LightStripsPlusHUEComponent' ];
        await super.onInit();
    }
}

module.exports = ColorTemperatureLightControllerDriver;