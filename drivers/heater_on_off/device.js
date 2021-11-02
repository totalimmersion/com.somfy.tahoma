/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
 homeyName: 'onoff', somfyNameGet: 'core:OnOffState', somfyNameSet: ['off', 'on'], compare: ['off', 'on'],
},
];
class HeaterOnOffDevice extends SensorDevice
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

module.exports = HeaterOnOffDevice;
