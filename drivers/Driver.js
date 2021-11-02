/* jslint node: true */

'use strict';

const Homey = require('homey');
/**
 * Base class for drivers
 * @class
 * @extends {Homey.Driver}
 */
class Driver extends Homey.Driver
{

    async onInit()
    {
        /** * Command Complete ** */
        this._triggerCommandComplete = this.homey.flow.getDeviceTriggerCard('device_command_complete');
    }

    triggerDeviceCommandComplete(device, commandName, success)
    {
        const tokens = { state: success, name: commandName };
        this.triggerFlow(this._triggerCommandComplete, device, tokens);
        return this;
    }

    async onPair(session)
    {
        session.setHandler('list_devices', async () =>
        {
            this.log('list_devices');
            const username = this.homey.settings.get('username');
            const password = this.homey.settings.get('password');
            if (!username || !password)
            {
                throw new Error(Homey.__('errors.on_pair_login_failure'));
            }
            return this.onReceiveSetupData();
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
                    name: device.label,
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

        return null;
    }

    /**
     * Triggers a flow
     * @param {this.homey.flow.getDeviceTriggerCard} trigger - A this.homey.flow.getDeviceTriggerCard instance
     * @param {Device} device - A Device instance
     * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
     */
    triggerFlow(trigger, device, tokens, state)
    {
        if (trigger)
        {
            trigger.trigger(device, tokens, state)
                .then(result =>
                {
                    if (result)
                    {
                        this.log(result);
                    }
                })
                .catch(error =>
                {
                    this.homey.app.logInformation(`triggerFlow (${trigger.id})`, error);
                });
        }
    }

    /**
     * Returns the io controllable name(s) of TaHoma
     * @return {Array} deviceType
     */
    getDeviceType()
    {
        return this.deviceType ? this.deviceType : false;
    }

}
module.exports = Driver;
