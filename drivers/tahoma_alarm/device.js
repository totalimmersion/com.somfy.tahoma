/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'alarm_generic',
        somfyNameGet: 'internal:IntrusionDetectedState',
        somfyNameSet: [],
        compare: ['notDetected', 'detected'],
    },
    {
        homeyName: 'tahoma_alarm_state',
        somfyNameGet: 'internal:CurrentAlarmModeState',
        somfyNameSet: ['setTargetAlarmMode'],
        conversions: { zone1: 'partial1', zone2: 'partial2' },
        secondaryCommand: { sos: { name: 'setIntrusionDetected', parameters: ['detected'] } },
    },
];

class TahomaAlarmDevice extends SensorDevice
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

    async triggerAlarmAction(state)
    {
        const deviceData = this.getData();
        const action = {
            name: 'setIntrusionDetected',
            parameters: [state],
        };

        const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
        if (result)
        {
            if (result.errorCode)
            {
                this.homey.app.logInformation(this.getName(),
                {
                    message: result.error,
                    stack: result.errorCode,
                });

                throw (new Error(result.error));
            }
        }
        else
        {
            this.homey.app.logInformation(`${this.getName()}: setIntrusionDetected`, 'Failed to send command');
            throw (new Error('Failed to send command'));
        }

        return true;
    }

}

module.exports = TahomaAlarmDevice;
