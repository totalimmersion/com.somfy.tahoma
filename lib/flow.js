"use strict";

const Homey = require('homey');
const taHoma = require('./tahoma');

module.exports.init = function() {

	/*** FLOW TRIGGER LISTENERS ***/
	/*** LUMINANCE TRIGGERS ***/
	new Homey.FlowCardTrigger('change_luminance_more_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_luminance < args.luminance;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardTrigger('change_luminance_less_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_luminance < args.luminance;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardTrigger('change_luminance_between')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
			return Promise.resolve(conditionMet);
		});

	/*** FLOW CONDITION LISTENERS ***/
	/*** LUMINANCE CONDITIONS ***/
	new Homey.FlowCardCondition('has_luminance_more_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_luminance > args.luminance;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardCondition('has_luminance_less_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_luminance < args.luminance;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardCondition('has_luminance_between')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
			return Promise.resolve(conditionMet);
		});


};