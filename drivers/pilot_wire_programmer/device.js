/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

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
                await this.homey.app.boostSync();
            }

            const deviceData = this.getData();
            if (this.executionId !== null)
            {
                // Wait for previous command to complete
                let retries = 20;
                while ((this.executionId !== null) && (retries-- > 0))
                {
                    await this.homey.app.asyncDelay(500);
                }
            }

            let action;
            if (value === false)
            {
                action = {
                    name: 'setOnOff',
                    parameters: ['off'],
                };
            }
            else
            {
                action = {
                    name: 'setOnOff',
                    parameters: ['on'],
                };
            }
            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result)
            {
                if (result.errorCode)
                {
                    this.homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode,
                    });

                    if (this.boostSync)
                    {
                        await this.homey.app.unBoostSync();
                    }
                    throw (new Error(result.error));
                }
                else
                {
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityOnOff`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('onoff', (value === 'on')).catch(this.error);
        }
    }

    async onCapabilityHeatingModeState(value, opts)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            let action;
            if (value === 'auto')
            {
                action = {
                    name: 'setActiveMode',
                    parameters: ['auto'],
                };
            }
            else if (value === 'comfort')
            {
                action = {
                    name: 'comfort',
                    parameters: ['comfort'],
                };
            }
            else if (value === 'eco')
            {
                action = {
                    name: 'comfort',
                    parameters: ['eco'],
                };
            }
            else if (value === 'free')
            {
                action = {
                    name: 'comfort',
                    parameters: ['free'],
                };
            }
            else if (value === 'secured')
            {
                action = {
                    name: 'comfort',
                    parameters: ['secured'],
                };
            }

            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result)
            {
                if (result.errorCode)
                {
                    this.homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode,
                    });
                    throw (new Error(result.error));
                }
                else
                {
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                    if (this.boostSync)
                    {
                        await this.homey.app.boostSync();
                    }
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityAlarmArmedState`, 'Failed to send command');
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('heating_mode', value).catch(this.error);
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
                    this.homey.app.logStates(`${this.getName()}: core:OnOffState = ${onOffState.value}`);
                    this.triggerCapabilityListener('onoff', (onOffState.value === 'on'),
                    {
                        fromCloudSync: true,
                    });
                }

                const heatingMode = states.find(state => state.name === 'ovp:HeatingTemperatureInterfaceActiveModeState');
                if (heatingMode)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:HeatingTemperatureInterfaceActiveModeState = ${heatingMode.value}`);
                    this.triggerCapabilityListener('heatingMode', heatingMode.value,
                    {
                        fromCloudSync: true,
                    });
                }
            }
        }
        catch (error)
        {
            this.setUnavailable(error.message).catch(this.error);
            this.homey.app.logInformation(this.getName(),
            {
                message: error.message,
                stack: error.stack,
            });
        }
    }

    // look for updates in the events array
    async syncEvents(events)
    {
        if (events === null)
        {
            this.sync();
            return;
        }

        const myURL = this.getDeviceUrl();

        // Process events sequentially so they are in the correct order
        for (let i = 0; i < events.length; i++)
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
                            message: 'Processing device state change event',
                            stack: element,
                        });
                    }
                    // Got what we need to update the device so lets find it
                    for (let x = 0; x < element.deviceStates.length; x++)
                    {
                        const deviceState = element.deviceStates[x];
                        if (deviceState.name === 'core:OnOffState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:OnOffState = ${deviceState.value}`);
                            const oldState = this.getState().onoff;
                            const newState = (deviceState.value === 'on');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('onoff', deviceState.value);
                            }
                        }
                        else if (deviceState.name === 'ovp:HeatingTemperatureInterfaceActiveModeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:HeatingTemperatureInterfaceActiveModeState = ${deviceState.value}`);
                            const oldState = this.getState().heatingMode;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('heatingMode', newState,
                                {
                                    fromCloudSync: true,
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
