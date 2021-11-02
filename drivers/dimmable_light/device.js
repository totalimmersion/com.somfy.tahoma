/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the io_dimmable_light controllable or hue:GenericDimmableLightHUEComponent name in TaHoma
 * @extends {LightControllerDevice}
 */

class DimmableLightControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        await super.onInit();
    }

}

module.exports = DimmableLightControllerDevice;
