/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');
const Homey = require('homey');

/**
 * Device class for the opening detector with the myfox:SomfyProtectAlarmController and myfox:HomeKeeperProAlarmController controllable name in TaHoma
 * @extends {SensorDevice}
 */

class OneAlarmDevice extends SensorDevice
{
    async onInit()
    {
        this.boostSync = true;

        this.alarmArmedState = {
            armed: 'armed',
            disarmed: 'disarmed',
            partial: 'partially_armed'
        };

        this.alarmTriggeredStatesMap = {
            detected: 'detected',
            notDetected: 'notDetected'
        };

        this.registerCapabilityListener('homealarm_state', this.onCapabilityAlarmArmedState.bind(this));
        this.registerCapabilityListener('alarm_generic', this.onCapabilityAlarmTriggeredState.bind(this));

        await super.onInit();
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

            this.setCapabilityValue('alarm_generic', value);
        }
    }

    async onCapabilityAlarmArmedState(value, opts)
    {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync)
        {
            var action;
            if (value == 'armed')
            {
                action = {
                    name: 'arm',
                    parameters: []
                };
            }
            if (value == 'disarmed')
            {
                action = {
                    name: 'disarm',
                    parameters: []
                };
            }
            if (value == 'partially_armed')
            {
                action = {
                    name: 'partial',
                    parameters: []
                };
            }
            let result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result !== undefined)
            {
                if (result.errorCode)
                {
                    this.homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode
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
                this.homey.app.logInformation(this.getName() + ": onCapabilityAlarmArmedState", "Failed to send command");
                throw (new Error("Failed to send command"));
            }
        }
        else
        {
            this.setCapabilityValue('homealarm_state', value);
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
                const intrusionState = states.find(state => state.name === 'core:IntrusionState');
                if (intrusionState)
                {
                    this.homey.app.logStates(this.getName() + ": core:IntrusionState = " + intrusionState.value);
                    this.triggerCapabilityListener('alarm_generic', intrusionState.value === 'detected');
                }

                const alarmStatusState = states.find(state => state.name === 'myfox:AlarmStatusState');
                if (alarmStatusState)
                {
                    this.homey.app.logStates(this.getName() + ": myfox:AlarmStatusState = " + alarmStatusState.value);
                    this.triggerCapabilityListener('homealarm_state', this.alarmArmedState[alarmStatusState.value],
                    {
                        fromCloudSync: true
                    });
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
                        if (deviceState.name === 'core:IntrusionState')
                        {
                            this.homey.app.logStates(this.getName() + ": core:IntrusionState = " + deviceState.value);
                            const oldState = this.getState().alarm_generic;
                            const newState = (deviceState.value === 'detected');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('alarm_generic', newState);
                            }
                        }
                        else if (deviceState.name === 'myfox:AlarmStatusState')
                        {
                            this.homey.app.logStates(this.getName() + ": myfox:AlarmStatusState = " + deviceState.value);
                            const oldState = this.getState().homealarm_state;
                            const newState = this.alarmArmedState[deviceState.value];
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('homealarm_state', newState,
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

module.exports = OneAlarmDevice;
