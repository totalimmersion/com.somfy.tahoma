'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the light sensor with the io:LightIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class LightSensorDevice extends SensorDevice
{

    async onInit()
    {
        this.registerCapabilityListener('measure_luminance', this.onCapabilityMeasureLuminance.bind(this));

        await super.onInit();
    }

    onCapabilityMeasureLuminance(value)
    {
        const oldLuminance = this.getState().measure_luminance;
        if (oldLuminance !== value)
        {
            this.setCapabilityValue('measure_luminance', value);

            const device = this;
            const tokens = {
                'luminance': value
            };

            const state = {
                'measure_luminance': value
            };

            //trigger flows
            this.getDriver()
                .triggerLuminanceMoreThan(device, tokens, state)
                .triggerLuminanceLessThan(device, tokens, state)
                .triggerLuminanceBetween(device, tokens, state);
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
                const luminance = states.find(state => state.name === 'core:LuminanceState');
                if (luminance)
                {
                    Homey.app.logStates(this.getName() + ": core:LuminanceState = " + luminance.value);
                    const oldLuminance = this.getState().measure_luminance;
                    if (oldLuminance !== luminance.value)
                    {
                        this.triggerCapabilityListener('measure_luminance', luminance.value);
                    }
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
                        if (deviceState.name === 'core:LuminanceState')
                        {
                            Homey.app.logStates(this.getName() + ": core:LuminanceState = " + deviceState.value);
                            const oldState = this.getState().measure_luminance;
                            if (oldState !== deviceState.value)
                            {
                                this.triggerCapabilityListener('measure_luminance', parseInt(deviceState.value));
                            }
                        }
                    }
                }
            }
        }
    }
}
module.exports = LightSensorDevice;