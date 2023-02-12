/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'heating_level2_state',
        somfyNameGet: 'io:TargetHeatingLevelState',
        somfyNameSet: ['setHeatingLevel'],
    }
];
class IOHeaterDevice extends SensorDevice
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

module.exports = IOHeaterDevice;
