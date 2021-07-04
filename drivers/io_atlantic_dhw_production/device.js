/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

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

        await super.onInit(CapabilitiesXRef);
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }
}

module.exports = WaterBoilerProductionDevice;