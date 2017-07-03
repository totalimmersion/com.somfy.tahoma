"use strict";

const taHoma = require('./tahoma');

module.exports.init = function() {

	/*** FLOW TRIGGER LISTENERS ***/
	Homey.manager('flow').on('trigger.change_luminance_more_than', function(callback, args, state) {
		console.log('trigger.change_luminance_more_than', args, state);
		var conditionMet = state.measure_luminance > args.luminance;
		callback(null, conditionMet);
	});

	Homey.manager('flow').on('trigger.change_luminance_less_than', function(callback, args, state) {
		console.log('trigger.change_luminance_less_than', args, state);
		var conditionMet = state.measure_luminance < args.luminance;
		callback(null, conditionMet);
	});

	Homey.manager('flow').on('trigger.change_luminance_between', function(callback, args, state) {
		console.log('trigger.change_luminance_between', args, state);
		var conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
		callback(null, conditionMet);
	});

	/*** FLOW CONDITION LISTENERS ***/
	Homey.manager('flow').on('condition.has_luminance_more_than', function(callback, args, state) {
		console.log('condition.has_luminance_more_than', args, state);

		var conditionMet = state.measure_luminance > args.luminance;
		callback(null, conditionMet);
	});

	Homey.manager('flow').on('condition.has_luminance_less_than', function(callback, args, state) {
		console.log('condition.has_luminance_less_than', args, state);

		var conditionMet = state.measure_luminance < args.luminance;
		callback(null, conditionMet);
	});

	Homey.manager('flow').on('condition.has_luminance_between', function(callback, args, state) {
		console.log('condition.has_luminance_between', args, state);

		var conditionMet = state.measure_luminance > args.luminance_from && state.measure_luminance < args.luminance_to;
		callback(null, conditionMet);
	});

	/*** FLOW ACTION LISTENERS ***/
	Homey.manager('flow').on('action.activate_scenario.scenario.autocomplete', function(callback, args) {
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
					return ( scenario.name.toLowerCase().indexOf( args.query.toLowerCase() ) > -1 );
				});
			}

			callback(null, scenarios);
		});
	});

	Homey.manager('flow').on('action.activate_scenario', function(callback, args){
		taHoma.executeScenario(args.scenario.oid, function(err, data) {
			if (err) {
				return;
			}

			callback(null, true);
		});
	});
};