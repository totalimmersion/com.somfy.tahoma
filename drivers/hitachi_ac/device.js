/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the io:AtlanticPassAPCHeatingAndCoolingZoneComponent, io:AtlanticPassAPCZoneControlZoneComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

class HitachiACDevice extends SensorDevice
{

    async onInit()
    {
        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
        this.registerCapabilityListener('ac_holiday_mode', this.onCapabilityHolidayMode.bind(this));
        this.registerMultipleCapabilityListener(['target_temperature', 'ac_fan_speed', 'ac_operating_mode','ac_auto_manual'], this.onCapabilityChange.bind(this), 500);

        await super.onInit();
        this.boostSync = true;
    }

    onAdded()
    {
        this.log('device added');
        this.sync();
    }

    async onCapabilityOnOff(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            const action = {
                name: 'setMainOperation',
                parameters: [value ? 'on' : 'off'],
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
            this.setCapabilityValue('onoff', value).catch(this.error);
        }
    }


    async onCapabilityHolidayMode(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            const deviceData = this.getData();
            const action = {
                name: 'setHolidays',
                parameters: [value ? 'on' : 'off'],
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
                this.homey.app.logInformation(`${this.getName()}: onCapabilityHolidayMode`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('onoff', value).catch(this.error);
        }
    }

    async onCapabilityChange(valueOj, optsObj)
    {
        let temp;
        let mode;
        let fan;
        let heatMode;

        if (valueOj.target_temperature)
        {
            temp = valueOj.target_temperature;
        }
        else
        {
            temp = this.getCapabilityValue('target_temperature');
            if (temp === null)
            {
                temp = 22;
            }
        }

        if (valueOj.ac_operating_mode)
        {
            heatMode = valueOj.aircon_mode;
        }
        else
        {
            heatMode = this.getCapabilityValue('ac_operating_mode');
            if (heatMode === null)
            {
                heatMode = 'cooling';
            }
        }

        if (valueOj.ac_fan_speed)
        {
            fan = valueOj.ac_fan_speed;
        }
        else
        {
            fan = this.getCapabilityValue('ac_fan_speed');
            if (fan === null)
            {
                fan = 'auto';
            }
        }

        if (valueOj.ac_auto_manual)
        {
            mode = valueOj.ac_auto_manual;
        }
        else
        {
            mode = this.getCapabilityValue('ac_auto_manual');
            if (mode === null)
            {
                mode = 'auto';
            }
        }

        // Send the command

        const deviceData = this.getData();
        const action = {
            name: 'globalControl',
            parameters: ['on', temp, fan, heatMode, mode],
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
            this.homey.app.logInformation(`${this.getName()}: onCapabilityChange`, 'Failed to send command');
            if (this.boostSync)
            {
                await this.homey.app.unBoostSync();
            }
            throw (new Error('Failed to send command'));
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
                const coolHeatingState = states.find(state => (state && (state.name === 'core:AutoManuModeState')));
                if (coolHeatingState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:AutoManuModeState = ${coolHeatingState.value}`);
                    this.setCapabilityValue('ac_auto_manual', coolHeatingState.value).catch(this.error);
                }

                const targetTemperatureState = states.find(state => (state && (state.name === 'core:TargetTemperatureState')));
                if (targetTemperatureState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:TargetTemperatureState = ${targetTemperatureState.value}`);
                    this.setCapabilityValue('target_temperature', targetTemperatureState.value).catch(this.error);
                }

                const fanSpeedState = states.find(state => (state && (state.name === 'ovp:FanSpeedState')));
                if (fanSpeedState)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:FanSpeedState = ${fanSpeedState.value}`);
                    this.setCapabilityValue('ac_fan_speed', fanSpeedState.value).catch(this.error);
                }

                const onOffMode = states.find(state => (state && (state.name === 'ovp:MainOperationState')));
                if (onOffMode)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:MainOperationState = ${onOffMode.value}`);
                    this.setCapabilityValue('onoff', onOffMode.value === 'on').catch(this.error);
                }

                const holidayMode = states.find(state => (state && (state.name === 'core:HolidaysModeState')));
                if (holidayMode)
                {
                    this.homey.app.logStates(`${this.getName()}: core:HolidaysModeState = ${holidayMode.value}`);
                    this.setCapabilityValue('ac_holiday_mode', holidayMode.value === 'on').catch(this.error);
                }

                const heatingMode = states.find(state => (state && (state.name === 'ovp:ModeChangeState')));
                if (heatingMode)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:ModeChangeState = ${heatingMode.value}`);
                    this.setCapabilityValue('ac_operating_mode', heatingMode.value.toLowerCase()).catch(this.error);
                }

                const currentTemp = states.find(state => (state && (state.name === 'ovp:RoomTemperatureState')));
                if (currentTemp)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:RoomTemperatureState = ${currentTemp.value}`);
                    this.setCapabilityValue('measure_temperature', currentTemp.value).catch(this.error);
                }

                const currentTempOutside = states.find(state => (state && (state.name === 'ovp:OutdoorTemperatureState')));
                if (currentTempOutside)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:OutdoorTemperatureState = ${currentTempOutside.value}`);
                    this.setCapabilityValue('measure_temperature.outside', currentTempOutside.value).catch(this.error);
                }

                const filterAlarm = states.find(state => (state && (state.name === 'ovp:FilterConditionState')));
                if (filterAlarm)
                {
                    this.homey.app.logStates(`${this.getName()}: ovp:FilterConditionState = ${filterAlarm.value}`);
                    this.setCapabilityValue('alarm_generic', filterAlarm.value.toLowerCase() === 'alert').catch(this.error);
                }
            }
        }
        catch (error)
        {
            // this.setUnavailable(error.message).catch(this.error);
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
                        if (deviceState.name === 'core:AutoManuModeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:AutoManuModeState = ${deviceState.value}`);
                            this.setCapabilityValue('ac_auto_manual', deviceState.value).catch(this.error);
                        }
                        else if (deviceState.name === 'core:TargetTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:TargetTemperatureState = ${deviceState.value}`);
                            this.setCapabilityValue('target_temperature', deviceState.value).catch(this.error);
                        }
                        else if (deviceState.name === 'ovp:FanSpeedState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:FanSpeedState = ${deviceState.value}`);
                            this.setCapabilityValue('ac_fan_speed', deviceState.value).catch(this.error);
                        }
                        else if (deviceState.name === 'ovp:MainOperationState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:MainOperationState = ${deviceState.value}`);
                            this.setCapabilityValue('onoff', deviceState.value === 'on').catch(this.error);
                        }
                        else if (deviceState.name === 'core:HolidaysModeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: core:HolidaysModeState = ${deviceState.value}`);
                            this.setCapabilityValue('ac_holiday_mode', deviceState === 'on').catch(this.error);
                        }
                        else if (deviceState.name === 'ovp:ModeChangeState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:ModeChangeState = ${deviceState.value}`);
                            this.setCapabilityValue('ac_operating_mode', deviceState.value.toLowerCase()).catch(this.error);
                        }
                        else if (deviceState.name === 'ovp:RoomTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:RoomTemperatureState = ${deviceState.value}`);
                            this.setCapabilityValue('measure_temperature', deviceState.value).catch(this.error);
                        }
                        else if (deviceState.name === 'ovp:OutdoorTemperatureState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:OutdoorTemperatureState = ${deviceState.value}`);
                            this.setCapabilityValue('measure_temperature.outside', deviceState.value).catch(this.error);
                        }
                        else if (deviceState.name === 'ovp:FilterConditionState')
                        {
                            this.homey.app.logStates(`${this.getName()}: ovp:FilterConditionState = ${deviceState.value}`);
                            this.setCapabilityValue('alarm_generic', deviceState.toLowerCase() === 'alert').catch(this.error);
                        }
                    }
                }
            }
        }
    }

}

module.exports = HitachiACDevice;
