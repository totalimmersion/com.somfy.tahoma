'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the hue:ColorTemperatureLightBulbHUEComponent controllable name in TaHoma
 * @extends {Driver}
 */
class WhiteTemperatureLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'hue:ColorTemperatureLightBulbHUEComponent' ];
        await super.onInit();
    }
}

module.exports = WhiteTemperatureLightControllerDriver;