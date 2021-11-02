/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');


/**
 * Driver class for the remote controller with the "io:IORemoteController" controllable name in TaHoma
 * @extends {Driver}
 */
class key_go_remoteDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ["io:KeygoController"];
        await super.onInit();

        this._remoteSateChangedTrigger = this.homey.flow.getDeviceTriggerCard('key_go_remote_state_changed');

        this._remoteSateChangedTriggerTo = this.homey.flow.getDeviceTriggerCard('key_go_remote_state_changed_to')
            .registerRunListener((args, state) => {
                // If true, this flow should run
                return Promise.resolve(args.expected_state === state.expected_state);
            });
    }

    async onReceiveSetupData(callback)
    {
        try
        {
            const devices = await this.homey.app.tahoma.getDeviceData();
            if (devices)
            {
                this.log('setup resolve');
                const homeyDevices = devices.filter(device => this.deviceType.indexOf(device.controllableName) !== -1).map(device => (
                {
                    name: device.label + ": " + (device.attributes[0].name === "core:GroupIndex" ? device.attributes[0].value : device.attributes[1].value),
                    data:
                    {
                        id: device.oid,
                        deviceURL: device.deviceURL,
                        label: device.label,
                        controllableName: device.controllableName
                    }
                }));
                callback(null, homeyDevices);
            }
        }
        catch (error)
        {
            this.homey.app.logInformation("OnReceiveSetupData", error);
            callback(error);
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

module.exports = key_go_remoteDriver;
