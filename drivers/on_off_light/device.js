/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

class simpleLightControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        await super.onInit();
    }

}

module.exports = simpleLightControllerDevice;
