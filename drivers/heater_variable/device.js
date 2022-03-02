/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'on_button',
        somfyNameGet: '',
        somfyNameSet: ['on'],
        parameters: '',
    },
    {
        homeyName: 'off_button',
        somfyNameGet: '',
        somfyNameSet: ['off'],
        parameters: '',
    },
    {
        homeyName: 'my_heat_level',
        somfyNameGet: '',
        somfyNameSet: ['my'],
        parameters: '',
    },
    {
        homeyName: 'heat_level',
        somfyNameGet: 'getLevel',
        somfyNameSet: ['setLevel'],
    },
];

class HeaterVariableDevice extends SensorDevice
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

module.exports = HeaterVariableDevice;
