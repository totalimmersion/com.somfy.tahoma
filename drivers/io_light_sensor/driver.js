'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the light sensor with the io:LightIOSystemSensor controllable name in TaHoma
 * @extends {Driver}
 */
class LightSensorDriver extends Driver {

  async onInit() {
    this.deviceType = ['io:LightIOSystemSensor', 'zwave:ZWaveLightSensor'];

    /*** LUMINANCE TRIGGERS ***/
    this._triggerLuminanceMoreThan = new Homey.FlowCardTriggerDevice('change_luminance_more_than').register();
    this._triggerLuminanceMoreThan.registerRunListener((args, state) => {
      let conditionMet = state.measure_luminance > args.luminance;
      return Promise.resolve(conditionMet);
    });

    this._triggerLuminanceLessThan = new Homey.FlowCardTriggerDevice('change_luminance_less_than').register();
    this._triggerLuminanceLessThan.registerRunListener((args, state) => {
      let conditionMet = state.measure_luminance < args.luminance;
      return Promise.resolve(conditionMet);
    });

    this._triggerLuminanceBetween = new Homey.FlowCardTriggerDevice('change_luminance_between').register();
    this._triggerLuminanceBetween.registerRunListener((args, state) => {
      let conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
      return Promise.resolve(conditionMet);
    });

    /*** LUMINANCE CONDITIONS ***/
    this._conditionLuminanceMoreThan = new Homey.FlowCardCondition('has_luminance_more_than').register();
    this._conditionLuminanceMoreThan.registerRunListener(args => {
      let device = args.device;
      let conditionMet = device.getState().measure_luminance > args.luminance;
      return Promise.resolve(conditionMet);
    });

    this._conditionLuminanceLessThan = new Homey.FlowCardCondition('has_luminance_less_than').register();
    this._conditionLuminanceLessThan.registerRunListener(args => {
      let device = args.device;
      let conditionMet = device.getState().measure_luminance < args.luminance;
      return Promise.resolve(conditionMet);
    });

    this._conditionLuminanceBetween = new Homey.FlowCardCondition('has_luminance_between').register();
    this._conditionLuminanceBetween.registerRunListener(args => {
      let device = args.device;
      let conditionMet = device.getState().measure_luminance > args.luminance_from && device.getState().measure_luminance < args.luminance_to;
      return Promise.resolve(conditionMet);
    });
  }

  /**
	 * Triggers the 'luminance more than x' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerLuminanceMoreThan(device, tokens, state) {
    this.triggerFlow(this._triggerLuminanceMoreThan, device, tokens, state);
    return this;
  }

  /**
	 * Triggers the 'luminance less than x' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerLuminanceLessThan(device, tokens, state) {
    this.triggerFlow(this._triggerLuminanceLessThan, device, tokens, state);
    return this;
  }

  /**
	 * Triggers the 'luminance between x and y' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
  triggerLuminanceBetween(device, tokens, state) {
    this.triggerFlow(this._triggerLuminanceBetween, device, tokens, state);
    return this;
  }
}

module.exports = LightSensorDriver;
