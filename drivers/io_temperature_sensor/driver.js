'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the temperature sensor with the io:TemperatureInCelciusIOSystemDeviceSensor, io:TemperatureIOSystemSensor, io:AtlanticPassAPCOutsideTemperatureSensor, io:AtlanticPassAPCZoneTemperatureSensor and ovp:SomfyPilotWireTemperatureSensorOVPComponent controllable name in TaHoma
 * @extends {Driver}
 */
class TemperatureSensorDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:TemperatureIOSystemSensor', 'io:AtlanticPassAPCOutsideTemperatureSensor', 'io:AtlanticPassAPCZoneTemperatureSensor', 'ovp:SomfyPilotWireTemperatureSensorOVPComponent', 'zwave:ZWaveTemperatureSensor', 'io:TemperatureInCelciusIOSystemDeviceSensor'];

    /*** TEMPERATURE TRIGGERS ***/
    this._triggerTemperatureMoreThan = new Homey.FlowCardTriggerDevice('change_temperature_more_than').register();
    this._triggerTemperatureMoreThan.registerRunListener((args, state) => {
      let conditionMet = state.measure_temperature > args.temperature;
      return Promise.resolve(conditionMet);
    });

    this._triggerTemperatureLessThan = new Homey.FlowCardTriggerDevice('change_temperature_less_than').register();
    this._triggerTemperatureLessThan.registerRunListener((args, state) => {
      let conditionMet = state.measure_temperature < args.temperature;
      return Promise.resolve(conditionMet);
    });

    this._triggerTemperatureBetween = new Homey.FlowCardTriggerDevice('change_temperature_between').register();
    this._triggerTemperatureBetween.registerRunListener((args, state) => {
      let conditionMet = state.measure_temperature > args.temperature_from && state.measure_temperature < args.temperature_to;
      return Promise.resolve(conditionMet);
    });

    /*** TEMPERATURE CONDITIONS ***/
    this._conditionTemperatureMoreThan = new Homey.FlowCardCondition('has_temperature_more_than').register();
    this._conditionTemperatureMoreThan.registerRunListener(args => {
      let device = args.device;
      let conditionMet = device.getState().measure_temperature > args.temperature;
      return Promise.resolve(conditionMet);
    });

    this._conditionTemperatureLessThan = new Homey.FlowCardCondition('has_temperature_less_than').register();
    this._conditionTemperatureLessThan.registerRunListener(args => {
      let device = args.device;
      let conditionMet = device.getState().measure_temperature < args.temperature;
      return Promise.resolve(conditionMet);
    });

    this._conditionTemperatureBetween = new Homey.FlowCardCondition('has_temperature_between').register();
    this._conditionTemperatureBetween.registerRunListener(args => {
      let device = args.device;
      let conditionMet = device.getState().measure_temperature > args.temperature_from && device.getState().measure_temperature < args.temperature_to;
      return Promise.resolve(conditionMet);
    });
  }

  /**
	 * Triggers the 'temperature more than x' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerTemperatureMoreThan(device, tokens, state) {
    this.triggerFlow(this._triggerTemperatureMoreThan, device, tokens, state);
    return this;
  }

  /**
	 * Triggers the 'temperature less than x' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerTemperatureLessThan(device, tokens, state) {
    this.triggerFlow(this._triggerTemperatureLessThan, device, tokens, state);
    return this;
  }

  /**
	 * Triggers the 'temperature between x and y' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerTemperatureBetween(device, tokens, state) {
    this.triggerFlow(this._triggerTemperatureBetween, device, tokens, state);
    return this;
  }
}

module.exports = TemperatureSensorDriver;
