/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the io:AtlanticDomesticHotWaterProductionV2_AEX_IOComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

const CapabilitiesXRef = [
    {
        somfyNameGet: 'core:TargetTemperatureState',
        somfyNameSet: ['setTargetTemperature'],
        homeyName: 'target_temperature',
    },
    {
        somfyNameGet: 'core:TemperatureState',
        somfyNameSet: [],
        homeyName: 'measure_temperature',
    },
];

class WaterBoilerProductionDevice extends SensorDevice
{

    async onInit()
    {
        await super.onInit(CapabilitiesXRef);
        this.boostSync = true;
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }

}

module.exports = WaterBoilerProductionDevice;
