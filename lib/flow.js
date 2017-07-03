"use strict";

const taHoma = require('./tahoma');

module.exports.init = function() {

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