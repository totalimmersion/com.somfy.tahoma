/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'heating_level_state',
        somfyNameGet: 'io:TargetHeatingLevelState',
        somfyNameSet: ['setHeatingLevel'],
    },
    {
        homeyName: 'onoff',
        somfyNameGet: 'core:OnOffState',
        somfyNameSet: ['off', ''],
        compare: ['off', 'on'],
        parameters: '',
    },
];
class ElectricHeaterDevice extends SensorDevice
{

    async onInit()
    {
        await super.onInit(CapabilitiesXRef);
        const dd = this.getData();
        this.boostSync = true;
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }

}

module.exports = ElectricHeaterDevice;
