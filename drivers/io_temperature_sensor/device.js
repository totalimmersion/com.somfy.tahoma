/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'defect_state',
        somfyNameGet: 'core:SensorDefectState',
        somfyNameSet: [],
        allowNull: true,
    },
    {
        homeyName: 'alarm_battery',
        somfyNameGet: 'core:SensorDefectState',
        somfyNameSet: [],
        allowNull: true,
        compare: ['nodefect', 'lowbattery']
    },
    {
        homeyName: 'measure_temperature',
        somfyNameGet: 'core:TemperatureState',
        somfyNameSet: [],
    },
];
class TemperatureSensorDevice extends SensorDevice
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

module.exports = TemperatureSensorDevice;
