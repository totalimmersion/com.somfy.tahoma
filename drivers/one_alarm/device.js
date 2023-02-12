/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the myfox:SomfyProtectAlarmController and myfox:HomeKeeperProAlarmController controllable name in TaHoma
 * @extends {SensorDevice}
 */

class OneAlarmDevice extends SensorDevice
{

    async onInit()
    {
        this.alarmArmedState = {
            armed: 'armed',
            disarmed: 'disarmed',
            partial: 'partially_armed',
        };

        this.alarmTriggeredStatesMap = {
            detected: 'detected',
            notDetected: 'notDetected',
        };

        this.registerCapabilityListener('homealarm_state', this.onCapabilityAlarmArmedState.bind(this));
        this.registerCapabilityListener('alarm_generic', this.onCapabilityAlarmTriggeredState.bind(this));

        await super.onInit();
        this.boostSync = true;
    }

    async onCapabilityAlarmTriggeredState(value)
    {
        const oldTriggeredState = this.getState().alarm_generic;
        if (oldTriggeredState !== value)
        {
            if (value)
            {
                this.checkTimerID = this.homey.setTimeout(() =>
                {
                    this.sync();
                }, 60000);
            }
            else
            {
                clearTimeout(this.checkTimerID);
            }

            this.setCapabilityValue('alarm_generic', value).catch(this.error);
        }
    }

    async onCapabilityAlarmArmedState(value, opts)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            let action;
            if (value === 'armed')
            {
                action = {
                    name: 'arm',
                    parameters: [],
                };
            }
            if (value === 'disarmed')
            {
                action = {
                    name: 'disarm',
                    parameters: [],
                };
            }
            if (value === 'partially_armed')
            {
                action = {
                    name: 'partial',
                    parameters: [],
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
                        if (!await this.homey.app.boostSync())
                        {
                            this.executionCmd = '';
                            this.executionId = null;
                        }
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
            this.setCapabilityValue('homealarm_state', value).catch(this.error);
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
                const intrusionState = states.find(state => (state && (state.name === 'core:IntrusionState')));
                if (intrusionState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:IntrusionState = ${intrusionState.value}`);
                    this.triggerCapabilityListener('alarm_generic', intrusionState.value === 'detected').catch(this.error);
                }

                const alarmStatusState = states.find(state => (state && (state.name === 'myfox:AlarmStatusState')));
                if (alarmStatusState)
                {
                    this.homey.app.logStates(`${this.getName()}: myfox:AlarmStatusState = ${alarmStatusState.value}`);
                    this.triggerCapabilityListener('homealarm_state', this.alarmArmedState[alarmStatusState.value],
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
                        if (deviceState.name === 'core:IntrusionState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:IntrusionState = ${deviceState.value}`);
                            const oldState = this.getState().alarm_generic;
                            const newState = (deviceState.value === 'detected');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('alarm_generic', newState).catch(this.error);
                            }
                        }
                        else if (deviceState.name === 'myfox:AlarmStatusState')
                        {
                            this.homey.app.logStates(`${this.getName()}: myfox:AlarmStatusState = ${deviceState.value}`);
                            const oldState = this.getState().homealarm_state;
                            const newState = this.alarmArmedState[deviceState.value];
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('homealarm_state', newState,
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

module.exports = OneAlarmDevice;
