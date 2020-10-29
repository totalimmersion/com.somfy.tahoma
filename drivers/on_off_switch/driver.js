'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the rts:LightRTSComponent and io:LightMicroModuleSomfyIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class OnOffLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'io:DimmableLightIOComponent', "hue:HueLuxHUEComponent" ];
        await super.onInit();
    }
}

module.exports = OnOffLightControllerDriver;