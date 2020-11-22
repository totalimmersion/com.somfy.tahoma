'use strict';

const LightControllerDevice = require('../LightControllerDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the light controller with the rts:LightRTSComponent, io:LightMicroModuleSomfyIOComponent and io:OnOffIOComponent controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class onOffLightControllerDevice extends LightControllerDevice
{
    async onInit()
    {
        await super.onInit();
    }
}

module.exports = onOffLightControllerDevice;