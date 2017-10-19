"use strict";

const Homey = require('homey');
const syncManager = require('./lib/sync');

class App extends Homey.App {

	onInit() {		
		this.log(`${Homey.app.manifest.id} running...`);

		this.addScenarioActionListeners();
		syncManager.init();
	}

	addScenarioActionListeners() {
		/*** ADD FLOW ACTION LISTENERS ***/
		new Homey.FlowCardAction('activate_scenario')
			.register()
			.registerRunListener((args, state) => {
				return taHoma.executeScenario(args.scenario.oid)
					.then(data => {
						return Promise.resolve();
					});
			})
			.getArgument('scenario')
			.registerAutocompleteListener((query, args) => {
				return taHoma.getActionGroups()
					.then(function (data) {
						var scenarios = new Array();

						if (data && data.constructor === Array) {
							for (var i=0; i<data.length; i++) {
								var scenario = {
									oid: data[i].oid,
									name: data[i].label
								};
								scenarios.push(scenario);
							}

							scenarios = scenarios.filter(function(scenario) {
								return ( scenario.name.toLowerCase().indexOf( query.toLowerCase() ) > -1 );
							});

						}

						return Promise.resolve(scenarios);
					})
					.catch(function (error) {
						console.log(error.message);
					});
			});
	}
}

module.exports = App;