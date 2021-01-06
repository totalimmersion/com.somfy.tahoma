'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for a light with the hue:ColorTemperatureLightBulbHUEComponent or hue:ColorTemperatureLightSpotHUEComponent controllable name in TaHoma
 * @extends {Driver}
 */
class WhiteTemperatureLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'hue:ColorTemperatureLightBulbHUEComponent', 'hue:ColorTemperatureLightSpotHUEComponent' ];
        await super.onInit();
    }
}

module.exports = WhiteTemperatureLightControllerDriver;