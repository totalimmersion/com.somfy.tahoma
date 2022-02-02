/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the io:DomesticHotWaterTankComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

class WaterTankDevice extends SensorDevice
{

    async onInit()
    {
        this.boostSync = true;

        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));

        await super.onInit();
    }

    async onCapabilityOnOff(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.boostSync)
            {
                if (!await this.homey.app.boostSync())
                {
                    throw (new Error('Failed to Boost Sync'));
                }
            }

            const deviceData = this.getData();
            let action;
            if (value === false)
            {
                action = {
                    name: 'setForceHeating',
                    parameters: ['off'],
                };
            }
            else
            {
                action = {
                    name: 'setForceHeating',
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
                const onOffState = states.find(state => (state && (state.name === 'core:ForceHeatingState')));
                if (onOffState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ForceHeatingState = ${onOffState.value}`);
                    this.triggerCapabilityListener('onoff', (onOffState.value === 'on'),
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
                        if (deviceState.name === 'core:ForceHeatingState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:ForceHeatingState = ${deviceState.value}`);
                            const oldState = this.getState().onoff;
                            const newState = (deviceState.value === 'on');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('onoff', deviceState.value).catch(this.error);
                            }
                        }
                    }
                }
            }
        }
    }

}

module.exports = WaterTankDevice;
