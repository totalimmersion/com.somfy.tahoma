/*jslint node: true */
'use strict';

const LightControllerDevice = require('../LightControllerDevice');
const Homey = require('homey');

/**
 * Device class for the light controller with the myfox:LightController controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class myFoxLightControllerDevice extends LightControllerDevice
{
    async onInit()
    {
        await super.onInit();
    }
}

module.exports = myFoxLightControllerDevice;
