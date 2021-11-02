/*jslint node: true */
"use strict";

const SensorDevice = require('../SensorDevice');
const Homey = require('homey');

/**
 * Device class for the opening detector with the enocean:EnOceanWindowHandle controllable name in TaHoma
 * @extends {SensorDevice}
 */
class WindowHandleDevice extends SensorDevice
{
    async onInit()
    {
        this.registerCapabilityListener('alarm_contact', this.onCapabilityAlarmContact.bind(this));

        await super.onInit();
    }

    onCapabilityAlarmContact(value)
    {
        const oldContactState = this.getState().alarm_contact;
        if (oldContactState !== value)
        {
            this.setCapabilityValue('alarm_contact', value);

            const device = this;
            const tokens = {
                'isOpen': value
            };

            const state = {
                'alarm_contact': value
            };

            //trigger flows
            return this.driver.triggerContactChange(device, tokens, state);
        }

        return Promise.resolve();
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     * @param {Array} data - device data from all the devices in the TaHoma cloud
     */
    async sync()
    {
        try
        {
            const states = await super.getStates();
            if (states)
            {
                const contactState = states.find(state => state.name === 'core:ThreeWayHandleDirectionState');
                if (contactState)
                {
                    this.homey.app.logStates(this.getName() + ": core:ThreeWayHandleDirectionState = " + contactState.value);
                    this.triggerCapabilityListener('alarm_contact', contactState.value != 'closed');
                }
            }
        }
        catch (error)
        {
            this.setUnavailable(null);
            this.homey.app.logInformation(this.getName(),
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
                    if (this.homey.app.infoLogEnabled)
                    {
                        this.homey.app.logInformation(this.getName(),
                        {
                            message: "Processing device state change event",
                            stack: element
                        });
                    }
                    // Got what we need to update the device so lets find it
                    for (var x = 0; x < element.deviceStates.length; x++)
                    {
                        const deviceState = element.deviceStates[x];
                        if (deviceState.name === 'core:ThreeWayHandleDirectionState')
                        {
                            this.homey.app.logStates(this.getName() + ": core:ThreeWayHandleDirectionState = " + deviceState.value);
                            const oldState = this.getState().alarm_contact;
                            const newState = (deviceState.value != 'closed');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('alarm_contact', newState);
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = WindowHandleDevice;
