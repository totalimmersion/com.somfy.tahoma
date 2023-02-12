/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

class onOffLSocketControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        const dd = this.getData();

        let controllableName = '';
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if (controllableName !== 'io:switchmicromodulesomfyiocomponent')
        {
            if (this.hasCapability('on_with_timer'))
            {
                this.removeCapability('on_with_timer');
            }
        }
        else
        {
            this.registerCapabilityListener('on_with_timer', this.sendOnWithTimer.bind(this));
        }

        await super.onInit();
    }

}

module.exports = onOffLSocketControllerDevice;
