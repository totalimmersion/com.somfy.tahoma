/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'alarm_siren', somfyNameGet: 'core:OnOffState', somfyNameSet: '', compare: ['off', 'on'] },
    { homeyName: 'alarm_battery', somfyNameGet: 'core:BatteryState', somfyNameSet: '', compare: ['normal', 'low'] },
    { homeyName: 'ring_button', somfyNameGet: '', somfyNameSet: 'ring', parameters: '' },
    { homeyName: 'stop_button', somfyNameGet: '', somfyNameSet: 'stop', parameters: '' }
];
class SirenDevice extends SensorDevice
{

    async onInit()
    {
        await super.onInit(CapabilitiesXRef);
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }
}

module.exports = SirenDevice;