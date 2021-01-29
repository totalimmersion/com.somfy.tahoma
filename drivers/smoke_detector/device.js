'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the Smoke detector with the rtds:RTDSSmokeSensor and io:SomfySmokeIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class SmokeDetectorDevice extends SensorDevice
{

    async onInit()
    {
        if (!this.hasCapability('test_smoke'))
        {
            this.addCapability('test_smoke');
        }

        this.registerCapabilityListener('alarm_smoke', this.onCapabilitySmokeAlarm.bind(this));
        this.registerCapabilityListener('test_smoke', this.onCapabilityTestSmoke.bind(this));

        await super.onInit();
    }

    onCapabilitySmokeAlarm(value)
    {
        const oldAlarmState = this.getState().alarm_smoke;
        if (oldAlarmState !== value)
        {
            this.setCapabilityValue('alarm_smoke', value);

            const device = this;
            const tokens = {
                'isSmoke': value
            };

            //trigger flows
            this.getDriver()
                .triggerSmokeChange(device, tokens);

            if (value)
            {
                this.checkTimerID = setTimeout(() =>
                {
                    this.sync();
                }, 60000);
            }
            else
            {
                clearTimeout(this.checkTimerID);
            }

        }

        return Promise.resolve();
    }

    async onCapabilityTestSmoke(value)
    {
        if (this.boostSync)
        {
            await Homey.app.boostSync();
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            await Tahoma.cancelExecution(this.executionId);
        }

        const action = {
            name: 'checkEventTrigger',
            parameters: ['short']
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
            Homey.app.logInformation(this.getName() + ": onCapabilityTestSmoke", "Failed to send command");
            if (this.boostSync)
            {
                await Homey.app.unBoostSync();
            }
            throw (new Error("Failed to send command"));
        };
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
                const alarmState = states.find(state => state.name === 'core:SmokeState');
                if (alarmState)
                {
                    Homey.app.logStates(this.getName() + ": core:SmokeState = " + alarmState.value);
                    this.triggerCapabilityListener('alarm_smoke', alarmState.value === 'detected');
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
                        if (deviceState.name === 'core:SmokeState')
                        {
                            Homey.app.logStates(this.getName() + ": core:SmokeState = " + deviceState.value);
                            const oldState = this.getState().alarm_smoke;
                            const newSate = (deviceState.value === 'detected');
                            if (oldState !== newSate)
                            {
                                this.triggerCapabilityListener('alarm_smoke', newSate);
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = SmokeDetectorDevice;