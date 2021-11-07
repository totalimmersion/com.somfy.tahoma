/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'onoff',
        somfyNameGet: 'core:LockedUnlockedState',
        somfyNameSet: ['setLockedUnlocked'],
        compare: ['unlocked', 'locked'],
    },
    {
        homeyName: 'locked',
        somfyNameGet: 'core:LockedUnlockedState',
        somfyNameSet: [],
        compare: ['unlocked', 'locked'],
    },
];
class DoorLockDevice extends SensorDevice
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

module.exports = DoorLockDevice;
