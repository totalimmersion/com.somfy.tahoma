'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

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
            var action = {
                name: 'setComfortTargetDHWTemperature',
                parameters: [value]
            };

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
                Homey.app.logInformation(this.getName() + ": onCapabilityTargetTemperatureComfort", "Failed to send command");
                if (this.boostSync)
                {
                    await Homey.app.unBoostSync();
                }
                throw (new Error("Failed to send command"));
            }
        }
        else
        {
            this.setCapabilityValue('target_temperature.comfort', value);
        }
    }

    async onCapabilityTargetTemperatureEco(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            var action = {
                name: 'setEcoTargetDHWTemperature',
                parameters: [value]
            };

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
                Homey.app.logInformation(this.getName() + ": onCapabilityTargetTemperatureEco", "Failed to send command");
                if (this.boostSync)
                {
                    await Homey.app.unBoostSync();
                }
                throw (new Error("Failed to send command"));
            }
        }
        else
        {
            this.setCapabilityValue('target_temperature.eco', value);
        }
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

    async onCapabilityBoilerMode(value, opts)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            var action = {
                name: 'setPassAPCDHWMode',
                parameters: [value]
            };

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
                Homey.app.logInformation(this.getName() + ": onCapabilityBoilerMode", "Failed to send command");
                throw (new Error("Failed to send command"));
            };
        }
        else
        {
            this.setCapabilityValue('boiler_mode', value);
        }
    }

    async onCapabilityBoostState(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            var action;
            if (value == false)
            {
                action = {
                    name: 'setBoostOnOffState',
                    parameters: ['off']
                };
            }
            else
            {
                action = {
                    name: 'setBoostOnOffState',
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
                Homey.app.logInformation(this.getName() + ": onCapabilityBoostState", "Failed to send command");
                if (this.boostSync)
                {
                    await Homey.app.unBoostSync();
                }
                throw (new Error("Failed to send command"));
            }
        }
        else
        {
            this.setCapabilityValue('boost', (value === 'on'));
        }
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     */
    async sync()
    {
        try
        {
            const states = await super.sync();
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

                const boilerMode = states.find(state => state.name === 'io:PassAPCDHWModeState');
                if (boilerMode)
                {
                    Homey.app.logStates(this.getName() + ": io:PassAPCDHWModeState = " + boilerMode.value);
                    this.triggerCapabilityListener('boiler_mode', boilerMode.value,
                    {
                        fromCloudSync: true
                    });
                }

                const boost = states.find(state => state.name === 'core:BoostOnOffState');
                if (boost)
                {
                    Homey.app.logStates(this.getName() + ": core:BoostOnOffState = " + boost.value);
                    this.triggerCapabilityListener('boost', boost.value === 'on',
                    {
                        fromCloudSync: true
                    });
                }

                const comfortTemp = states.find(state => state.name === 'core:ComfortTargetDHWTemperatureState');
                if (comfortTemp)
                {
                    Homey.app.logStates(this.getName() + ": core:ComfortTargetDHWTemperatureState = " + comfortTemp.value);
                    this.triggerCapabilityListener('target_temperature.comfort', comfortTemp.value,
                    {
                        fromCloudSync: true
                    });
                }

                const ecoTemp = states.find(state => state.name === 'core:EcoTargetDHWTemperatureState');
                if (ecoTemp)
                {
                    Homey.app.logStates(this.getName() + ": core:EcoTargetDHWTemperatureState = " + ecoTemp.value);
                    this.triggerCapabilityListener('target_temperature.eco', ecoTemp.value,
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
                        else if (deviceState.name === 'core:BoostOnOffState')
                        {
                            Homey.app.logStates(this.getName() + ": core:BoostOnOffState = " + deviceState.value);
                            const oldState = this.getState().boost;
                            const newState = deviceState.value === 'on';
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boost', newState,
                                {
                                    fromCloudSync: true
                                });
                            }
                        }
                        else if (deviceState.name === 'io:PassAPCDHWModeState')
                        {
                            Homey.app.logStates(this.getName() + ": io:PassAPCDHWModeState = " + deviceState.value);
                            const oldState = this.getState().boiler_mode;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boiler_mode', newState,
                                {
                                    fromCloudSync: true
                                });
                            }
                        }
                        else if (deviceState.name === 'core:ComfortTargetDHWTemperatureState')
                        {
                            Homey.app.logStates(this.getName() + ": core:ComfortTargetDHWTemperatureState = " + deviceState.value);
                            const oldState = this.getState().target_temperature.comfort;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.comfort', newState,
                                {
                                    fromCloudSync: true
                                });
                            }
                        }
                        else if (deviceState.name === 'core:EcoTargetDHWTemperatureState')
                        {
                            Homey.app.logStates(this.getName() + ": core:EcoTargetDHWTemperatureState = " + deviceState.value);
                            const oldState = this.getState().target_temperature.eco;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.eco', newState,
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

module.exports = WaterBoilerDevice;