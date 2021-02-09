'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the opening detector with the ovp:SomfyPilotWireHeatingInterfaceOVPComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

class PilotWireProgrammerDevice extends SensorDevice
{
    async onInit()
    {
        this.boostSync = true;

        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
        this.registerCapabilityListener('heating_mode', this.onCapabilityHeatingModeState.bind(this));

        await super.onInit();
    }

    async onCapabilityOnOff(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.boostSync)
            {
                await Homey.app.boostSync();
            }

            const deviceData = this.getData();
            if (this.executionId !== null)
            {
                // Wait for previous command to complete
                let retries = 20;
                while ((this.executionId !== null) && (retries-- > 0))
                {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            var action;
            if (value == false)
            {
                action = {
                    name: 'setOnOff',
                    parameters: ['off']
                };
            }
            else
            {
                action = {
                    name: 'setOnOff',
                    parameters: ['on']
                };
            }
            let result = await Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result !== undefined)
            {
                if (result.errorCode)
                {
                    Homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode
                    });

                    if (this.boostSync)
                    {
                        await Homey.app.unBoostSync();
                    }
                    throw (new Error(result.error));
                }
                else
                {
                    this.executionId = result.execId;
                }
            }
            else
            {
                Homey.app.logInformation(this.getName() + ": onCapabilityOnOff", "Failed to send command");
                if (this.boostSync)
                {
                    await Homey.app.unBoostSync();
                }
                throw (new Error("Failed to send command"));
            }
        }
        else
        {
            this.setCapabilityValue('onoff', (value === 'on'));
        }
    }

    async onCapabilityHeatingModeState(value, opts)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            var action;
            if (value == 'auto')
            {
                action = {
                    name: 'setActiveMode',
                    parameters: ['auto']
                };
            }
            else if (value == 'comfort')
            {
                action = {
                    name: 'comfort',
                    parameters: ['comfort']
                };
            }
            else if (value == 'eco')
            {
                action = {
                    name: 'comfort',
                    parameters: ['eco']
                };
            }
            else if (value == 'free')
            {
                action = {
                    name: 'comfort',
                    parameters: ['free']
                };
            }
            else if (value == 'secured')
            {
                action = {
                    name: 'comfort',
                    parameters: ['secured']
                };
            }

            let result = await Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result !== undefined)
            {
                if (result.errorCode)
                {
                    Homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode
                    });
                    throw (new Error(result.error));
                }
                else
                {
                    this.executionId = result.execId;
                    if (this.boostSync)
                    {
                        await Homey.app.boostSync();
                    }
                }
            }
            else
            {
                Homey.app.logInformation(this.getName() + ": onCapabilityAlarmArmedState", "Failed to send command");
                throw (new Error("Failed to send command"));
            };
        }
        else
        {
            this.setCapabilityValue('heating_mode', value);
        }
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     */
    async sync()
    {
        try
        {
            const states = await super.getStates();
            if (states)
            {
                const onOffState = states.find(state => state.name === 'core:OnOffState');
                if (onOffState)
                {
                    Homey.app.logStates(this.getName() + ": core:OnOffState = " + onOffState.value);
                    this.triggerCapabilityListener('onoff', (onOffState.value === 'on'),
                    {
                        fromCloudSync: true
                    });
                }

                const heatingMode = states.find(state => state.name === 'ovp:HeatingTemperatureInterfaceActiveModeState');
                if (heatingMode)
                {
                    Homey.app.logStates(this.getName() + ": ovp:HeatingTemperatureInterfaceActiveModeState = " + heatingMode.value);
                    this.triggerCapabilityListener('heatingMode', heatingMode.value,
                    {
                        fromCloudSync: true
                    });
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
            if (element['name'] === 'DeviceStateChangedEvent')
            {
                if ((element['deviceURL'] === myURL) && element['deviceStates'])
                {
                    // Got what we need to update the device so lets find it
                    for (var x = 0; x < element.deviceStates.length; x++)
                    {
                        const deviceState = element.deviceStates[x];
                        if (deviceState.name === 'core:OnOffState')
                        {
                            Homey.app.logStates(this.getName() + ": core:OnOffState = " + deviceState.value);
                            const oldState = this.getState().onoff;
                            const newState = (deviceState.value === 'on');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('onoff', deviceState.value);
                            }
                        }
                        else if (deviceState.name === 'ovp:HeatingTemperatureInterfaceActiveModeState')
                        {
                            Homey.app.logStates(this.getName() + ": ovp:HeatingTemperatureInterfaceActiveModeState = " + deviceState.value);
                            const oldState = this.getState().heatingMode;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('heatingMode', newState,
                                {
                                    fromCloudSync: true
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = PilotWireProgrammerDevice;