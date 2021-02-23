/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'measure_luminance', somfyNameGet: 'core:LuminanceState', somfyNameSet: '' }
];

class LightSensorDevice extends SensorDevice
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
module.exports = LightSensorDevice;