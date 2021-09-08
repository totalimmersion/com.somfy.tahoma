/*jslint node: true */
'use strict';

const Homey = require('homey');
const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'alarm_siren', somfyNameGet: 'core:OnOffState', somfyNameSet: [], compare: ['off', 'on'] },
    { homeyName: 'alarm_battery', somfyNameGet: 'core:BatteryState', somfyNameSet: [], compare: ['normal', 'low'] },
    { homeyName: 'ring_button', somfyNameGet: '', somfyNameSet: ['ring'], parameters: '' },
    { homeyName: 'stop_button', somfyNameGet: '', somfyNameSet: ['ringWithSingleSimpleSequence', 'off'], parameters: '' },
    { homeyName: 'soundAlarm_1_button', somfyNameGet: '', somfyNameSet: ['ringWithSingleSimpleSequence'], parameterArray: [120000,100,0,"memorizedVolume"] }
];
class SirenDevice extends SensorDevice
{

    async onInit()
    {
        if (!this.hasCapability("soundAlarm_1_button"))
        {
            this.addCapability("soundAlarm_1_button");
            Homey.App.asyncDelay( 200 );
        }

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