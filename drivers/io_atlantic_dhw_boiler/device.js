/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the io:AtlanticPassAPCDHWComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

class WaterBoilerDevice extends SensorDevice
{

    async onInit()
    {
        this.boostSync = true;

        this.registerCapabilityListener('target_temperature.comfort', this.onCapabilityTargetTemperatureComfort.bind(this));
        this.registerCapabilityListener('target_temperature.eco', this.onCapabilityTargetTemperatureEco.bind(this));
        this.registerCapabilityListener('boiler_mode', this.onCapabilityBoilerMode.bind(this));
        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
        this.registerCapabilityListener('boost', this.onCapabilityBoostState.bind(this));

        await super.onInit();
    }

    async onCapabilityTargetTemperatureComfort(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            const action = {
                name: 'setComfortTargetDHWTemperature',
                parameters: [value],
            };

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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityTargetTemperatureComfort`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('target_temperature.comfort', value).catch(this.error);
        }
    }

    async onCapabilityTargetTemperatureEco(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            const action = {
                name: 'setEcoTargetDHWTemperature',
                parameters: [value],
            };

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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityTargetTemperatureEco`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('target_temperature.eco', value).catch(this.error);
        }
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

    async onCapabilityBoilerMode(value, opts)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            const action = {
                name: 'setPassAPCDHWMode',
                parameters: [value],
            };

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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityBoilerMode`, 'Failed to send command');
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('boiler_mode', value).catch(this.error);
        }
    }

    async onCapabilityBoostState(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            let action;
            if (value === false)
            {
                action = {
                    name: 'setBoostOnOffState',
                    parameters: ['off'],
                };
            }
            else
            {
                action = {
                    name: 'setBoostOnOffState',
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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityBoostState`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('boost', (value === 'on')).catch(this.error);
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
                const onOffState = states.find(state => (state && (state.name === 'core:OnOffState')));
                if (onOffState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:OnOffState = ${onOffState.value}`);
                    this.triggerCapabilityListener('onoff', (onOffState.value === 'on'),
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                const boilerMode = states.find(state => (state && (state.name === 'io:PassAPCDHWModeState')));
                if (boilerMode)
                {
                    this.homey.app.logStates(`${this.getName()}: io:PassAPCDHWModeState = ${boilerMode.value}`);
                    this.triggerCapabilityListener('boiler_mode', boilerMode.value,
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                const boost = states.find(state => (state && (state.name === 'core:BoostOnOffState')));
                if (boost)
                {
                    this.homey.app.logStates(`${this.getName()}: core:BoostOnOffState = ${boost.value}`);
                    this.triggerCapabilityListener('boost', boost.value === 'on',
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                const comfortTemp = states.find(state => (state && (state.name === 'core:ComfortTargetDHWTemperatureState')));
                if (comfortTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ComfortTargetDHWTemperatureState = ${comfortTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.comfort', comfortTemp.value,
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                const ecoTemp = states.find(state => state.name === 'core:EcoTargetDHWTemperatureState');
                if (ecoTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:EcoTargetDHWTemperatureState = ${ecoTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.eco', ecoTemp.value,
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
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
                                this.triggerCapabilityListener('onoff', deviceState.value).catch(this.error);
                            }
                        }
                        else if (deviceState.name === 'core:BoostOnOffState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:BoostOnOffState = ${deviceState.value}`);
                            const oldState = this.getState().boost;
                            const newState = deviceState.value === 'on';
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boost', newState,
                                {
                                    fromCloudSync: true,
                                }).catch(this.error);
                            }
                        }
                        else if (deviceState.name === 'io:PassAPCDHWModeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: io:PassAPCDHWModeState = ${deviceState.value}`);
                            const oldState = this.getState().boiler_mode;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boiler_mode', newState,
                                {
                                    fromCloudSync: true,
                                }).catch(this.error);
                            }
                        }
                        else if (deviceState.name === 'core:ComfortTargetDHWTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:ComfortTargetDHWTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.comfort;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.comfort', newState,
                                {
                                    fromCloudSync: true,
                                }).catch(this.error);
                            }
                        }
                        else if (deviceState.name === 'core:EcoTargetDHWTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:EcoTargetDHWTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.eco;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.eco', newState,
                                {
                                    fromCloudSync: true,
                                }).catch(this.error);
                            }
                        }
                    }
                }
            }
        }
    }

}

module.exports = WaterBoilerDevice;
