/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the io_dimmable_light controllable, hue:GenericDimmableLightHUEComponent or io:DimmableLightMicroModuleSomfyIOComponent name in TaHoma
 * @extends {LightControllerDevice}
 */

class DimmableLightControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        const dd = this.getData();
        let controllableName = '';
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if (controllableName === 'ogp:light')
        {
            if (this.hasCapability('onoff'))
            {
                this.removeCapability('onoff');
            }
        }

        if (controllableName !== 'io:dimmablelightmicromodulesomfyiocomponent')
        {
            if (this.hasCapability('on_with_timer'))
            {
                this.removeCapability('on_with_timer');
            }
        }
        else
        {
            this.registerCapabilityListener('on_with_timer', this.sendOnWithTimer.bind(this));
            this.setCapabilityValue('on_with_timer', 0).catch(this.error);
        }
        await super.onInit();
    }

 }

module.exports = DimmableLightControllerDevice;
