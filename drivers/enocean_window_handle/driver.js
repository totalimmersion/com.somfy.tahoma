'use strict';

/* jslint node: true */
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the enocean:EnOceanWindowHandle controllable name in TaHoma
 * @extends {Driver}
 */
class WindowHandleDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['enocean:EnOceanWindowHandle'];

        /** * CONTACT TRIGGERS ** */
        this._triggerContactChange = this.homey.flow.getDeviceTriggerCard('contact_has_changed');
    }

    /**
     * Triggers the 'contact change' flow
     * @param {Device} device - A Device instance
     * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
     * @param {Object} state - An object with properties which are accessible throughout the Flow
     */
    triggerContactChange(device, tokens, state)
    {
        this.triggerFlow(this._triggerContactChange, device, tokens, state);
        return this;
    }

}

module.exports = WindowHandleDriver;
