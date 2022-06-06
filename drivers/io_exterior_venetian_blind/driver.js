/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class ExteriorVenetianBlindDriver extends ioWindowCoveringsDriver
{

    async onInit()
    {
        this.deviceType = ['io:ExteriorVenetianBlindIOComponent', 'ogp:VenetianBlind', 'io:ExteriorVenetianBlindUnoIOComponent'];

        this.tilt_changedTrigger = this.homey.flow.getDeviceTriggerCard('windowcoverings_tilt_changed');

        await super.onInit();
    }

    /**
     * Triggers the 'tilt change' flow
     * @param {Device} device - A Device instance
     * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
     * @param {Object} state - An object with properties which are accessible throughout the Flow
     */
    triggerTiltChange(device, tokens, state)
    {
        this.triggerFlow(this.tilt_changedTrigger, device, tokens, state);
        return this;
    }

}

module.exports = ExteriorVenetianBlindDriver;
