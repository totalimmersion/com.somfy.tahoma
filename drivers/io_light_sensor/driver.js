/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the light sensor with the io:LightIOSystemSensor controllable name in TaHoma
 * @extends {Driver}
 */
class LightSensorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:LightIOSystemSensor', 'zwave:ZWaveLightSensor'];

        /** * LUMINANCE TRIGGERS ** */
        this._triggerLuminanceMoreThan = this.homey.flow.getDeviceTriggerCard('change_luminance_more_than');
        this._triggerLuminanceMoreThan.registerRunListener((args, state) =>
        {
            const conditionMet = state.measure_luminance > args.luminance;
            return Promise.resolve(conditionMet);
        });

        this._triggerLuminanceLessThan = this.homey.flow.getDeviceTriggerCard('change_luminance_less_than');
        this._triggerLuminanceLessThan.registerRunListener((args, state) =>
        {
            const conditionMet = state.measure_luminance < args.luminance;
            return Promise.resolve(conditionMet);
        });

        this._triggerLuminanceBetween = this.homey.flow.getDeviceTriggerCard('change_luminance_between');
        this._triggerLuminanceBetween.registerRunListener((args, state) =>
        {
            const conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
            return Promise.resolve(conditionMet);
        });
    }

    triggerFlows(device, capability, value)
    {
        const tokens = {
            luminance: value,
        };

        const state = {
            measure_luminance: value,
        };

        this.triggerFlow(this._triggerLuminanceMoreThan, device, tokens, state);
        this.triggerFlow(this._triggerLuminanceLessThan, device, tokens, state);
        this.triggerFlow(this._triggerLuminanceBetween, device, tokens, state);
    }

}

module.exports = LightSensorDriver;
