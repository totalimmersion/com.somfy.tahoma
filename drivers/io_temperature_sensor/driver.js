/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the temperature sensor with the io:TemperatureInCelciusIOSystemDeviceSensor, io:TemperatureIOSystemSensor,
 *  io:AtlanticPassAPCOutsideTemperatureSensor, io:AtlanticPassAPCZoneTemperatureSensor and ovp:SomfyPilotWireTemperatureSensorOVPComponent controllable name in TaHoma
 * @extends {Driver}
 */
class TemperatureSensorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:TemperatureIOSystemSensor',
            'io:AtlanticPassAPCOutsideTemperatureSensor',
            'io:AtlanticPassAPCZoneTemperatureSensor',
            'ovp:SomfyPilotWireTemperatureSensorOVPComponent',
            'zwave:ZWaveTemperatureSensor',
            'io:TemperatureInCelciusIOSystemDeviceSensor',
        ];

        /** * TEMPERATURE TRIGGERS ** */
        this._triggerTemperatureMoreThan = this.homey.flow.getDeviceTriggerCard('change_temperature_more_than');
        this._triggerTemperatureMoreThan.registerRunListener((args, state) =>
        {
            const conditionMet = state.measure_temperature > args.temperature;
            return Promise.resolve(conditionMet);
        });

        this._triggerTemperatureLessThan = this.homey.flow.getDeviceTriggerCard('change_temperature_less_than');
        this._triggerTemperatureLessThan.registerRunListener((args, state) =>
        {
            const conditionMet = state.measure_temperature < args.temperature;
            return Promise.resolve(conditionMet);
        });

        this._triggerTemperatureBetween = this.homey.flow.getDeviceTriggerCard('change_temperature_between');
        this._triggerTemperatureBetween.registerRunListener((args, state) =>
        {
            const conditionMet = state.measure_temperature > args.temperature_from && state.measure_temperature < args.temperature_to;
            return Promise.resolve(conditionMet);
        });
    }

    triggerFlows(device, capability, value)
    {
        const tokens = {
            temperature: value,
        };

        const state = {
            measure_temperature: value,
        };

        this.triggerFlow(this._triggerTemperatureMoreThan, device, tokens, state);
        this.triggerFlow(this._triggerTemperatureLessThan, device, tokens, state);
        this.triggerFlow(this.measure_temperature, device, tokens, state);
    }

}

module.exports = TemperatureSensorDriver;
