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
        let dd = this.getData();

        let controllableName = "";
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if (controllableName === 'io:OnOffIOComponent')
        {
            if (this.getClass() != 'socket')
            {
                this.setClass('socket');
            }
        }
        await super.onInit();
    }
}

module.exports = onOffLightControllerDevice;