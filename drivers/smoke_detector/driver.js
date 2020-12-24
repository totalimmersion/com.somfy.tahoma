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

    /**
     * Triggers the 'alarm smoke change' flow
     * @param {Device} device - A Device instance
     * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
     * @param {Object} state - An object with properties which are accessible throughout the Flow
     */
    triggerSmokeChange(device, tokens, state)
    {
        this.triggerFlow(this._triggerSmokeChange, device, tokens, state);
        return this;
    }
}

module.exports = SmokeDetectorDriver;