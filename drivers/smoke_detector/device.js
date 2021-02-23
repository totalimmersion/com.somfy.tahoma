/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'alarm_smoke', somfyNameGet: 'core:SmokeState', somfyNameSet: '', compare: ['', 'detected'] },
    { homeyName: 'test_smoke', somfyNameGet: '', somfyNameSet: 'checkEventTrigger', parameters: 'short' }
];
class SmokeDetectorDevice extends SensorDevice
{

    async onInit()
    {
        if (!this.hasCapability('test_smoke'))
        {
            this.addCapability('test_smoke');
        }

        await super.onInit(CapabilitiesXRef);
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }
}

module.exports = SmokeDetectorDevice;