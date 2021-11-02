/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the myfox:LightController controllable name in TaHoma
 * @extends {Driver}
 */
class myFoxLightControllerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['myfox:LightController'];
        await super.onInit();
    }

    /**
     * Triggers the 'contact change' flow
     * @param {Device} device - A Device instance
     * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
     * @param {Object} state - An object with properties which are accessible throughout the Flow
     */
    triggerOnOffChange(device, tokens, state)
    {
        this.triggerFlow(this._triggerOnOffChange, device, tokens, state);
        return this;
    }

}

module.exports = myFoxLightControllerDriver;
