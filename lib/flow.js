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

	/*** TEMPERATURE TRIGGERS ***/
	new Homey.FlowCardTrigger('change_temperature_more_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_temperature > args.temperature;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardTrigger('change_temperature_less_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_temperature < args.temperature;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardTrigger('change_temperature_between')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_temperature > args.temperature_from && state.measure_temperature < args.temperature_to;
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

	/*** TEMPERATURE CONDITIONS ***/
	new Homey.FlowCardCondition('has_temperature_more_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_temperature > args.temperature;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardCondition('has_temperature_less_than')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_temperature < args.temperature;
			return Promise.resolve(conditionMet);
		});

	new Homey.FlowCardCondition('has_temperature_between')
		.register()
		.registerRunListener((args, state) => {
			let conditionMet = state.measure_temperature > args.temperature_from && state.measure_temperature < args.temperature_to;
			return Promise.resolve(conditionMet);
		});

	/*** FLOW ACTION LISTENERS ***/
	new Homey.FlowCardAction('activate_scenario')
		.register()
		.registerRunListener((args, state) => {

			taHoma.executeScenario(args.scenario.oid, function(err, data) {
				if (err) {
					return;
				}

				return Promise.resolve(null, true);
			});

		})
		.getArgument('scenario')
		.registerAutocompleteListener((query, args) => {

			taHoma.getActionGroups(function(err, data) {
				var scenarios = new Array();

				if (data && data.constructor === Array) {
					for (var i=0; i<data.length; i++) {
						var scenario = {
							oid: data[i].oid,
							name: data[i].label
						}
						scenarios.push(scenario);
					}

					scenarios = scenarios.filter(function(scenario) {
						return ( scenario.name.toLowerCase().indexOf( query.toLowerCase() ) > -1 );
					});
				}

				return Promise.resolve(scenarios);
			});

		});
};