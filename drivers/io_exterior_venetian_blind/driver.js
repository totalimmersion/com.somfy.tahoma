'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ExteriorVenetianBlindDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ['io:ExteriorVenetianBlindIOComponent'];

        this.tilt_changedTrigger = new Homey.FlowCardTriggerDevice('windowcoverings_tilt_changed')
            .register();

        this.set_tilt_position = new Homey.FlowCardAction('windowcoverings_tilt');
        this.set_tilt_position
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("windowcoverings_tilt");
                return args.device.onCapabilityWindowcoveringsTiltSet(args.windowcoverings_set, null);
            })
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
    };
}

module.exports = ExteriorVenetianBlindDriver;