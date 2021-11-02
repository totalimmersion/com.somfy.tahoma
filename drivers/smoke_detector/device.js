/*jslint node: true */
'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'alarm_smoke', somfyNameGet: 'core:SmokeState', somfyNameSet: [], compare: ['', 'detected'] },
    { homeyName: 'alarm_battery.radio', somfyNameGet: 'io:MaintenanceRadioPartBatteryState', somfyNameSet: [], compare: ['normal', 'low'] },
    { homeyName: 'alarm_battery.sensor', somfyNameGet: 'io:MaintenanceSensorPartBatteryState', somfyNameSet: [], compare: ['normal', 'low'] },
    { homeyName: 'alarm_room_state', somfyNameGet: 'io:SensorRoomState', somfyNameSet: [], compare: ['0', '1'] },
    { homeyName: 'test_smoke', somfyNameGet: '', somfyNameSet: ['checkEventTrigger'], parameters: 'short' }
];
class SmokeDetectorDevice extends SensorDevice
{

    async onInit()
    {
        if (!this.hasCapability('test_smoke'))
        {
            this.addCapability('test_smoke').catch(this.error);
        }

        if (!this.hasCapability('alarm_battery.radio'))
        {
            this.addCapability('alarm_battery.radio').catch(this.error);
        }

        if (!this.hasCapability('alarm_battery.sensor'))
        {
            this.addCapability('alarm_battery.sensor').catch(this.error);
        }

        if (!this.hasCapability('alarm_room_state'))
        {
            this.addCapability('alarm_room_state').catch(this.error);
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
