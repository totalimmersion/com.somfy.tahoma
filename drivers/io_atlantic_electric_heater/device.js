/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'target_temperature', somfyNameGet: 'core:TargetTemperatureState', somfyNameSet: ['setTargetTemperature'] },
    { homeyName: 'target_temperature.comfort_heating', somfyNameGet: 'core:ComfortRoomTemperatureState', somfyNameSet: ['setComfortTemperature'] },
    { homeyName: 'target_temperature.eco_heating', somfyNameGet: 'core:EcoRoomTemperatureState', somfyNameSet: ['setEcoTemperature'] },
    { homeyName: 'target_temperature.derogated', somfyNameGet: 'core:DerogatedTargetTemperatureState', somfyNameSet: ['setDerogatedTargetTemperature'] },
    { homeyName: 'cancel_heating', somfyNameGet: '', somfyNameSet: ['cancelHeatingLevel'] },
    { homeyName: 'regulation_mode_state', somfyNameGet: 'core:RegulationModeState', somfyNameSet: [] },
    { homeyName: 'power_state', somfyNameGet: 'io:PowerState', somfyNameSet: [] },
    { homeyName: 'native_function_level_state', somfyNameGet: 'io:NativeFunctionalLevelState', somfyNameSet: [] },
    { homeyName: 'heating_level_state', somfyNameGet: 'io:TargetHeatingLevelState', somfyNameSet: [] },
    { homeyName: 'occupancy_activation', somfyNameGet: 'core:OccupancyActivationState', somfyNameSet: ['setOccupancyActivation'], compare: ['inactive', 'active'] },
    { homeyName: 'open_window_activation', somfyNameGet: 'core:OpenWindowDetectionActivationState', somfyNameSet: ['setOpenWindowDetectionActivation'], compare: ['inactive', 'active'] },
    { homeyName: 'eh_operating_mode', somfyNameGet: 'core:OperatingModeState', somfyNameSet: ['setOperatingMode'] },
    { homeyName: 'onoff', somfyNameGet: 'core:OnOffState', somfyNameSet: ['off', 'on'], compare: ['off', 'on'] }
];
class ElectricHeaterDevice extends SensorDevice
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

module.exports = ElectricHeaterDevice;