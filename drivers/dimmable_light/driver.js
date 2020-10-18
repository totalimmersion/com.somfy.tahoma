'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the io:DimmableLightIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class DimmableLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'io:DimmableLightIOComponent', "hue:HueLuxHUEComponent" ];
        await super.onInit();
    }
}

module.exports = DimmableLightControllerDriver;