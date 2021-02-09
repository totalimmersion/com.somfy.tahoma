'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

const CapabilitiesXRef = [
    { homeyName: 'alarm_contact', somfyNameGet: 'core:ContactState', somfyNameSet: '', compare: ['close', 'open'] }
];
class OpeningDetectorDevice extends SensorDevice
{

    async onInit()
    {
        await super.onInit(CapabilitiesXRef);
    }

    // look for updates in the events array
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }
}

module.exports = OpeningDetectorDevice;