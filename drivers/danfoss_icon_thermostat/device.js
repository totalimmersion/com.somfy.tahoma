/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

/**
 * Device class for the opening detector with the zigbee:DanfossHeatingFloorComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */

const CapabilitiesXRef = [
    {
        somfyNameGet: 'core:TargetTemperatureState',
        somfyNameSet: ['setTargetTemperature'],
        homeyName: 'target_temperature',
    },
    {
        somfyNameGet: 'core:RoomTemperatureState',
        somfyNameSet: [],
        homeyName: 'measure_temperature',
    },
    {
        somfyNameGet: 'zigbee:DanfossScheduleTypeUsedState',
        somfyNameSet: ['setDanfossScheduleTypeUsed'],
        homeyName: 'ac_holiday_mode',
        compare: ['regular', 'vacation'],
    },
];

class DanfossIconThermostatDevice extends SensorDevice
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

module.exports = DanfossIconThermostatDevice;
