/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'alarm_water', somfyNameGet: 'core:WaterDetectionState', somfyNameSet: [], compare: ["notDetected", "detected"] }
];

class WaterSensorDevice extends SensorDevice
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
module.exports = WaterSensorDevice;