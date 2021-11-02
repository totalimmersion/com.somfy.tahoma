/*jslint node: true */
'use strict';

const Device = require('../Device');
const Homey = require('homey');

/**
 * Device class for the remote controller with the "io:IORemoteController" controllable name in TaHoma
 * @extends {Device}
 */

class io_open_close_remoteDevice extends Device
{
    async onInit()
    {
        this.registerCapabilityListener('remote_state', this.onCapabilityRemoteState.bind(this));

        await super.onInit();
    }

    onCapabilityRemoteState(value)
    {
        const oldState = this.getState().remote_state;
        if (oldState !== value)
        {
            this.setCapabilityValue('remote_state', value);

            const device = this;
            const tokens = {
                'remote_state': value
            };
            const state = {
                'expected_state': value
            };

            //trigger flows
            this.getDriver().triggerRemoteSateChange(device, tokens, state);
            this.getDriver().triggerRemoteSateChangeTo(device, tokens, state);
        }

        return Promise.resolve();
    }

    /**
     * Gets the data from the TaHoma cloud
     */
    async sync()
    {
        try
        {
            const states = await super.getStates();
            if (states)
            {
                const remoteState = states.find(state => state.name === 'io:OneWayControllerButtonState');
                if (remoteState)
                {
                    Homey.app.logStates(this.getName() + ": io:OneWayControllerButtonState = " + remoteState.value);
                    this.triggerCapabilityListener('remote_state', remoteState.value);
                }
            }
        }
        catch (error)
        {
            this.setUnavailable(null);
            Homey.app.logInformation(this.getName(),
            {
                message: error.message,
                stack: error.stack
            });

        }
    }

    // look for updates in the events array
    async syncEvents(events)
    {
        if (events === null)
        {
            return this.sync();
        }

        const myURL = this.getDeviceUrl();

        // Process events sequentially so they are in the correct order
        for (var i = 0; i < events.length; i++)
        {
            const element = events[i];
            if (element.name === 'DeviceStateChangedEvent')
            {
                if ((element.deviceURL === myURL) && element.deviceStates)
                {
                    if (Homey.app.infoLogEnabled)
                    {
                        Homey.app.logInformation(this.getName(),
                        {
                            message: "Processing device state change event",
                            stack: element
                        });
                    }
                    // Got what we need to update the device so lets find it
                    for (var x = 0; x < element.deviceStates.length; x++)
                    {
                        const deviceState = element.deviceStates[x];
                        if (deviceState.name === 'io:OneWayControllerButtonState')
                        {
                            Homey.app.logStates(this.getName() + ": io:OneWayControllerButtonState = " + deviceState.value);
                            const oldState = this.getState().remote_state;
                            const newSate = deviceState.value;
                            if (oldState !== newSate)
                            {
                                this.triggerCapabilityListener('remote_state', newSate);
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = io_open_close_remoteDevice;
