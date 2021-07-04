/*jslint node: true */
'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the rts:LightRTSComponent, io:LightMicroModuleSomfyIOComponent and io:OnOffIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class OnOffLightControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'rts:LightRTSComponent', "io:LightMicroModuleSomfyIOComponent", "io:OnOffIOComponent" ];
        await super.onInit();
    }
}

module.exports = OnOffLightControllerDriver;