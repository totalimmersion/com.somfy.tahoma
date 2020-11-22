'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the opening detector with the io:SomfymotionIOSystemSensor and rtds:RTDSMotionSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class OccupancyDetectorDevice extends SensorDevice
{

    async onInit()
    {
        this.registerCapabilityListener('alarm_motion', this.onCapabilityAlarmMotion.bind(this));

        await super.onInit();
    }

    onCapabilityAlarmMotion(value)
    {
        const oldMotionState = this.getState().alarm_motion;
        if (oldMotionState !== value)
        {
            this.setCapabilityValue('alarm_motion', value);

            const device = this;
            const tokens = {
                'isMotion': value
            };

            const state = {
                'alarm_motion': value
            };

            //trigger flows
            this.getDriver().triggerMotionChange(device, tokens, state);
        }

        return Promise.resolve();
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
                const contactState = states.find(state => state.name === 'core:OccupancyState');
                if (contactState)
                {
                    Homey.app.logStates(this.getName() + ": core:OccupancyState = " + contactState.value);
                    this.log(this.getName(), contactState.value);
                    this.triggerCapabilityListener('alarm_motion', contactState.value === 'personInside');
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
                        if (deviceState.name === 'core:OccupancyState')
                        {
                            Homey.app.logStates(this.getName() + ": core:OccupancyState = " + deviceState.value);
                            const oldState = this.getState().alarm_motion;
                            const newState = (deviceState.value === 'personInside');
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener('alarm_motion', newState);
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = OccupancyDetectorDevice;