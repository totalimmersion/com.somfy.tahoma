/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the rts:LightRTSComponent, io:LightMicroModuleSomfyIOComponent and io:OnOffIOComponent controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class onOffLightControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        const dd = this.getData();

        let controllableName = '';
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if (controllableName === 'io:OnOffIOComponent')
        {
            if (this.getClass() !== 'socket')
            {
                this.setClass('socket');
            }
        }

        await super.onInit();
    }

}

module.exports = onOffLightControllerDevice;
