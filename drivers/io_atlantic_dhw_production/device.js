'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the opening detector with the io:AtlanticDomesticHotWaterProductionV2_AEX_IOComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

/**
  List of capabilities to look for
 * CapabilitiesXRef {
        somfyNameGet: 'name of the Somfy capability to get the value',
        somfyNameSet: 'name of the Somfy capability to set the value',
        homeyName: 'name of the Homey capability',
        compare: [] 'text array for false and true value or not specified if real value',
        scale: scale factor
    }
*/
const CapabilitiesXRef = [
    { somfyNameGet: 'core:TargetTemperatureState', somfyNameSet: 'setTargetTemperature', homeyName: 'target_temperature' },
    { somfyNameGet: 'core:TemperatureState', somfyNameSet: '', homeyName: 'measure_temperature' }
];

class WaterBoilerProductionDevice extends SensorDevice
{
    async onInit()
    {
        this.boostSync = true;

        CapabilitiesXRef.forEach(element =>
        {
            this.registerCapabilityListener(element.homeyName, this.onCapability.bind(this, element));
        });

        // this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
        // this.registerCapabilityListener('target_temperature.frost', this.onCapabilityTargetTemperatureFrost.bind(this));
        // this.registerCapabilityListener('target_temperature.halted', this.onCapabilityTargetTemperatureHalted.bind(this));

        // this.registerCapabilityListener('target_temperature.comfort', this.onCapabilityTargetTemperatureComfort.bind(this));
        // this.registerCapabilityListener('target_temperature.eco', this.onCapabilityTargetTemperatureEco.bind(this));

        // this.registerCapabilityListener('operating_mode', this.onCapabilityOperatingMode.bind(this));
        // this.registerCapabilityListener('rate_management', this.onCapabilityRateManagement.bind(this));

        await super.onInit();
    }

    // async onCapabilityTargetTemperature(value, opts)
    // {
    //     this.onCapability('setTargetTemperature', 'target_temperature', value, opts);
    // }

    // async onCapabilityTargetTemperatureFrost(value, opts)
    // {
    //     this.onCapability('setFrostProtectionTargetTemperature', 'target_temperature.frost', value, opts);
    // }

    // async onCapabilityTargetTemperatureHalted(value, opts)
    // {
    //     this.onCapability('setHaltedTargetTemperature', 'target_temperature.halted', value, opts);
    // }

    // async onCapabilityTargetTemperatureComfort(value, opts)
    // {
    //     this.onCapability('setComfortTargetTemperature', 'target_temperature.comfort', value, opts);
    // }

    // async onCapabilityTargetTemperatureEco(value, opts)
    // {
    //     this.onCapability('setEcoTargetTemperature', 'target_temperature.eco', value, opts);
    // }

    // async onCapabilityOperatingMode(value, opts)
    // {
    //     this.onCapability('setCurrentOperatingMode', 'operating_mode', value, opts);
    // }

    // async onCapabilityRateManagement(value, opts)
    // {
    //     this.onCapability('setRateManagement', 'rate_management', value, opts);
    // }

    /**
     * Gets the sensor data from the TaHoma cloud
     */
    async sync()
    {
        super.syncList(CapabilitiesXRef);
    }

    async getSync()
    {
        return super.sync();
    }

    // look for updates in the events array
    async syncEvents(events)
    {
        if (events === null)
        {
            return this.sync();
        }

        this.syncEventsList(CapabilitiesXRef);
    }
}

module.exports = WaterBoilerProductionDevice;