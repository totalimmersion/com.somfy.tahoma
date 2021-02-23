/*jslint node: true */
'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the io:DimmableLightIOComponent or hue:GenericDimmableLightHUEComponent controllable name in TaHoma
 * @extends {Driver}
 */
class DimmableLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'io:DimmableLightIOComponent', "hue:HueLuxHUEComponent", "hue:GenericDimmableLightHUEComponent" ];
        await super.onInit();
    }
}

module.exports = DimmableLightControllerDriver;