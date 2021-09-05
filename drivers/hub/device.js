/*jslint node: true */
'use strict';

const Homey = require('homey');
const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'calendar_state_on', somfyNameGet: '', somfyNameSet: 'activateCalendar', parameters: '' },
    { homeyName: 'calendar_state_off', somfyNameGet: '', somfyNameSet: 'deactivateCalendar', parameters: '' },
    { homeyName: 'dim', somfyNameGet: 'internal:LightingLedPodModeState', somfyNameSet: 'setLightingLedPodMode' },
];
class SirenDevice extends SensorDevice
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

module.exports = SirenDevice;