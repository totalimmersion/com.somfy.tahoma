/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the remote controller with the "io:IORemoteController" controllable name in TaHoma
 * @extends {Driver}
 */
// eslint-disable-next-line camelcase
class io_open_close_remoteDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:IORemoteController'];
        await super.onInit();

        this._remoteSateChangedTrigger = this.homey.flow.getDeviceTriggerCard('remote_state_changed');

        this._remoteSateChangedTriggerTo = this.homey.flow.getDeviceTriggerCard('remote_state_changed_to')
            .registerRunListener((args, state) =>
            {
                // If true, this flow should run
                return Promise.resolve(args.expected_state === state.expected_state);
            });
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

// eslint-disable-next-line camelcase
module.exports = io_open_close_remoteDriver;
