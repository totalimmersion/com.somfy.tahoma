/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the io:AtlanticPassAPCHeatingAndCoolingZoneComponent, io:AtlanticPassAPCZoneControlZoneComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

class HotColdZoneDevice extends SensorDevice
{

    async onInit()
    {
        this.boostSync = true;

        this.registerCapabilityListener('target_temperature.comfort_cooling', this.onCapabilityTargetTemperatureComfortCooling.bind(this));
        this.registerCapabilityListener('target_temperature.comfort_heating', this.onCapabilityTargetTemperatureComfortHeating.bind(this));
        this.registerCapabilityListener('target_temperature.eco_cooling', this.onCapabilityTargetTemperatureEcoCooling.bind(this));
        this.registerCapabilityListener('target_temperature.eco_heating', this.onCapabilityTargetTemperatureEcoHeating.bind(this));
        this.registerCapabilityListener('target_temperature.derogated', this.onCapabilityTargetTemperatureDerogated.bind(this));
        this.registerCapabilityListener('boost.cooling', this.onCapabilityOnOffCooling.bind(this));
        this.registerCapabilityListener('boost.heating', this.onCapabilityOnOffHeating.bind(this));
        this.registerCapabilityListener('boost.derogated', this.onCapabilityOnOffDerogated.bind(this));

        this.registerCapabilityListener('heat_cool_mode.cool', this.onCapabilityHeatCoolModeCool.bind(this));
        this.registerCapabilityListener('heat_cool_mode.heat', this.onCapabilityHeatCoolModeHeat.bind(this));

        await super.onInit();
    }

    async ProcessTargetTemperature(value, opts, name, capability)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            const action = {
                name,
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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityTargetTemperature ${capability}`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue(capability, value).catch(this.error);
        }
    }

    async onCapabilityTargetTemperatureComfortCooling(value, opts)
    {
        return this.ProcessTargetTemperature(value, opts, 'setComfortCoolingTargetTemperature', 'target_temperature.comfort_cooling');
    }

    async onCapabilityTargetTemperatureComfortHeating(value, opts)
    {
        return this.ProcessTargetTemperature(value, opts, 'setComfortHeatingTargetTemperature', 'target_temperature.comfort_heating');
    }

    async onCapabilityTargetTemperatureEcoCooling(value, opts)
    {
        return this.ProcessTargetTemperature(value, opts, 'setEcoCoolingTargetTemperature', 'target_temperature.eco_cooling');
    }

    async onCapabilityTargetTemperatureEcoHeating(value, opts)
    {
        return this.ProcessTargetTemperature(value, opts, 'setEcoHeatingTargetTemperature', 'target_temperature.eco_heating');
    }

    async onCapabilityTargetTemperatureDerogated(value, opts)
    {
        return this.ProcessTargetTemperature(value, opts, 'setDerogatedTargetTemperature', 'target_temperature.derogated');
    }

    async ProcessCapabilityOnOff(value, opts, name, capability)
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
                    name,
                    parameters: ['off'],
                };
            }
            else
            {
                action = {
                    name,
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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityOnOff ${capability}`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue(capability, (value === 'on')).catch(this.error);
        }
    }

    async onCapabilityOnOffCooling(value, opts)
    {
        return this.ProcessCapabilityOnOff(value, opts, 'setCoolingOnOffState', 'boost.cooling');
    }

    async onCapabilityOnOffHeating(value, opts)
    {
        return this.ProcessCapabilityOnOff(value, opts, 'setHeatingOnOffState', 'boost.heating');
    }

    async onCapabilityOnOffDerogated(value, opts)
    {
        return this.ProcessCapabilityOnOff(value, opts, 'setDerogationOnOffState', 'boost.derogated');
    }

    async processPassAPCMode(value, opts, name, capability)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            const action = {
                name,
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
                this.homey.app.logInformation(`${this.getName()}: onCapability ${capability}`, 'Failed to send command');
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue(capability, value).catch(this.error);
        }
    }

    async onCapabilityHeatCoolModeCool(value, opts)
    {
        return this.processPassAPCMode(value, opts, 'setPassAPCCoolingMode', 'heat_cool_mode.cool');
    }

    async onCapabilityHeatCoolModeHeat(value, opts)
    {
        return this.processPassAPCMode(value, opts, 'setPassAPCHeatingMode', 'heat_cool_mode.heat');
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
                const onOffStateCooling = states.find(state => state.name === 'core:CoolingOnOffState');
                if (onOffStateCooling)
                {
                    this.homey.app.logStates(`${this.getName()}: core:CoolingOnOffState = ${onOffStateCooling.value}`);
                    this.triggerCapabilityListener('boost.cooling', (onOffStateCooling.value === 'on'),
                    {
                        fromCloudSync: true,
                    });
                }

                const onOffStateHating = states.find(state => state.name === 'core:HeatingOnOffState');
                if (onOffStateHating)
                {
                    this.homey.app.logStates(`${this.getName()}: core:HeatingOnOffState = ${onOffStateHating.value}`);
                    this.triggerCapabilityListener('boost.heating', (onOffStateHating.value === 'on'),
                    {
                        fromCloudSync: true,
                    });
                }

                const onOffStateDerogated = states.find(state => state.name === 'core:DerogationOnOffState');
                if (onOffStateDerogated)
                {
                    this.homey.app.logStates(`${this.getName()}: core:DerogationOnOffState = ${onOffStateDerogated.value}`);
                    this.triggerCapabilityListener('boost.derogated', (onOffStateDerogated.value === 'on'),
                    {
                        fromCloudSync: true,
                    });
                }

                const coolingMode = states.find(state => state.name === 'io:PassAPCCoolingModeState');
                if (coolingMode)
                {
                    this.homey.app.logStates(`${this.getName()}: io:PassAPCCoolingModeState = ${coolingMode.value}`);
                    this.triggerCapabilityListener('heat_cool_mode.cool', coolingMode.value,
                    {
                        fromCloudSync: true,
                    });
                }

                const heatingMode = states.find(state => state.name === 'io:PassAPCHeatingModeState');
                if (heatingMode)
                {
                    this.homey.app.logStates(`${this.getName()}: io:PassAPCHeatingModeState = ${heatingMode.value}`);
                    this.triggerCapabilityListener('heat_cool_mode.heat', heatingMode.value,
                    {
                        fromCloudSync: true,
                    });
                }

                const comfortCoolingTemp = states.find(state => state.name === 'core:ComfortCoolingTargetTemperatureState');
                if (comfortCoolingTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ComfortCoolingTargetTemperatureState = ${comfortCoolingTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.comfort_cooling', comfortCoolingTemp.value,
                    {
                        fromCloudSync: true,
                    });
                }
                const comfortHeatingTemp = states.find(state => state.name === 'core:ComfortHeatingTargetTemperatureState');
                if (comfortHeatingTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ComfortHeatingTargetTemperatureState = ${comfortHeatingTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.comfort_heating', comfortHeatingTemp.value,
                    {
                        fromCloudSync: true,
                    });
                }

                const ecoCoolingTemp = states.find(state => state.name === 'core:EcoCoolingTargetTemperatureState');
                if (ecoCoolingTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ComfortCoolingTargetTemperatureState = ${ecoCoolingTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.eco_cooling', ecoCoolingTemp.value,
                    {
                        fromCloudSync: true,
                    });
                }

                const ecoHeatingTemp = states.find(state => state.name === 'core:EcoHeatingTargetTemperatureState');
                if (ecoHeatingTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:EcoHeatingTargetTemperatureState = ${ecoHeatingTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.eco_heating', ecoHeatingTemp.value,
                    {
                        fromCloudSync: true,
                    });
                }

                const DerogatedHeatingTemp = states.find(state => state.name === 'core:DerogatedHeatingTargetTemperatureState');
                if (DerogatedHeatingTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: core:DerogatedHeatingTargetTemperatureState = ${DerogatedHeatingTemp.value}`);
                    this.triggerCapabilityListener('target_temperature.derogated', DerogatedHeatingTemp.value,
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
                        if (deviceState.name === 'core:CoolingOnOffState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:CoolingOnOffState = ${deviceState.value}`);
                            const oldState = this.getState().boost.cooling;
                            const newState = (deviceState.value === 'on');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boost.cooling', deviceState.value,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:HeatingOnOffState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:HeatingOnOffState = ${deviceState.value}`);
                            const oldState = this.getState().boost.heating;
                            const newState = (deviceState.value === 'on');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boost.heating', deviceState.value,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:DerogationOnOffState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:DerogationOnOffState = ${deviceState.value}`);
                            const oldState = this.getState().boost.derogated;
                            const newState = (deviceState.value === 'on');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('boost.derogated', deviceState.value,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'io:PassAPCCoolingModeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: io:PassAPCCoolingModeState = ${deviceState.value}`);
                            const oldState = this.getState().heat_cool_mode.cool;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('heat_cool_mode.cool', newState,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'io:PassAPCHeatingModeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: io:PassAPCHeatingModeState = ${deviceState.value}`);
                            const oldState = this.getState().heat_cool_mode.heat;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('heat_cool_mode.heat', newState,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:ComfortCoolingTargetTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:ComfortCoolingTargetTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.comfort_cooling;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.comfort_cooling', newState,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:ComfortHeatingTargetTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:ComfortHeatingTargetTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.comfort_heating;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.comfort_heating', newState,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:EcoCoolingTargetTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:EcoCoolingTargetTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.comfort_cooling;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.eco_cooling', newState,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:EcoHeatingTargetTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:EcoHeatingTargetTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.eco_heating;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.eco_heating', newState,
                                {
                                    fromCloudSync: true,
                                });
                            }
                        }
                        else if (deviceState.name === 'core:DerogatedHeatingTargetTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:DerogatedHeatingTargetTemperatureState = ${deviceState.value}`);
                            const oldState = this.getState().target_temperature.derogated;
                            const newState = deviceState.value;
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('target_temperature.derogated', newState,
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

module.exports = HotColdZoneDevice;
