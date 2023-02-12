/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the remote controller with the "io:IORemoteController" or "io:IzymoController" controllable name in TaHoma
 * @extends {Driver}
 */
// eslint-disable-next-line camelcase
class key_go_remoteDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:KeygoController', 'io:IzymoController'];
        await super.onInit();

        this._remoteSateChangedTrigger = this.homey.flow.getDeviceTriggerCard('key_go_remote_state_changed');

        this._remoteSateChangedTriggerTo = this.homey.flow.getDeviceTriggerCard('key_go_remote_state_changed_to')
            .registerRunListener((args, state) => {
                // If true, this flow should run
                return Promise.resolve(args.expected_state === state.expected_state);
            });
    }

    async onReceiveSetupData()
    {
        try
        {
            const devices = await this.homey.app.tahoma.getDeviceData();
            if (devices)
            {
                this.log('setup resolve');
                const homeyDevices = devices.filter(device => this.deviceType.indexOf(device.controllableName) !== -1).map(device => (
                {
                    name: `${device.label}: ${device.attributes[0].name === 'core:GroupIndex' ? device.attributes[0].value : device.attributes[1].value}`,
                    data:
                    {
                        id: device.oid,
                        deviceURL: device.deviceURL,
                        label: device.label,
                        controllableName: device.controllableName,
                    },
                }));
                return homeyDevices;
            }
        }
        catch (error)
        {
            this.homey.app.logInformation('OnReceiveSetupData', error);
            throw new Error(error.message);
        }
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
module.exports = key_go_remoteDriver;
