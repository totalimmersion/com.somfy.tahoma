'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the remote controller with the "io:IORemoteController" controllable name in TaHoma
 * @extends {Driver}
 */
class io_open_close_remoteDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ["io:IORemoteController"];
        await super.onInit();

        this._remoteSateChangedTrigger = new Homey.FlowCardTriggerDevice('remote_state_changed')
            .register()

        this._remoteSateChangedTriggerTo = new Homey.FlowCardTriggerDevice('remote_state_changed_to')
            .registerRunListener((args, state) =>
            {
                // If true, this flow should run
                return Promise.resolve(args.expected_state === state.expected_state);

            })
            .register()
    }

    triggerRemoteSateChange(device, tokens, state)
    {
        this.triggerFlow(this._remoteSateChangedTrigger, device, tokens, state);
        return this;
    }

    triggerRemoteSateChangeTo(device, tokens, state)
    {
        this.triggerFlow(this._remoteSateChangedTriggerTo, device, tokens, state);
        return this;
    }
}

module.exports = io_open_close_remoteDriver;