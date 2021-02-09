'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the rtds:RTDSSmokeSensor and io:SomfySmokeIOSystemSensor controllable name in TaHoma
 * @extends {Driver}
 */
class SmokeDetectorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rtds:RTDSSmokeSensor', 'io:SomfySmokeIOSystemSensor'];

        /*** ALARM SMOKE TRIGGERS ***/
        this._triggerSmokeChange = new Homey.FlowCardTriggerDevice('smoke_has_changed').register();
        this._triggerSmokeChange.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });
    }

    triggerFlows(device, capability, value)
    {
        const tokens = {
            'isSmoke': value
        };

        this.triggerFlow(this._triggerSmokeChange, device, tokens);
    }
}

module.exports = SmokeDetectorDriver;