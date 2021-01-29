'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the light sensor with the io:CumulatedElectricalEnergyConsumptionIOSystemDeviceSensor,  io:TotalElectricalEnergyConsumptionIOSystemSensor, io:TotalElectricalEnergyConsumptionSensor, io:OtherElectricalEnergyConsumptionSensor, io:PlugsElectricalEnergyConsumptionSensor, io:DHWElectricalEnergyConsumptionSensor, io:CoolingRelatedElectricalEnergyConsumptionSensor, io:HeatingRelatedElectricalEnergyConsumptionSensor & io:HeatingElectricalEnergyConsumptionSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */
class EnergySensorDevice extends SensorDevice
{

    async onInit()
    {
        await super.onInit();
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
                const power = states.find(state => state.name === 'core:ElectricEnergyConsumptionState');
                if (power)
                {
                    this.setCapabilityValue('meter_power', power.value / 1000);
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
                        if (deviceState.name === 'core:ElectricEnergyConsumptionState')
                        {
                            this.setCapabilityValue('meter_power', parseInt(deviceState.value) / 1000);
                        }
                    }
                }
            }
        }
    }
}
module.exports = EnergySensorDevice;