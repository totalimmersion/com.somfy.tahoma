"use strict";

const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');
const syncManager = require('./lib/sync');

/**
 * This class is the starting point of the app and initializes the neccessary services, listeners, etc.
 * @extends {Homey.App}
 **/
class App extends Homey.App {

	/**
	 * Initializes the app
	 */
	onInit() {		
		this.log(`${Homey.app.manifest.id} running...`);

		this.addScenarioActionListeners();
		syncManager.init();
	}

	/**
	 * Adds a listener for flowcard scenario actions
	 */
	addScenarioActionListeners() {
		/*** ADD FLOW ACTION LISTENERS ***/
		new Homey.FlowCardAction('activate_scenario')
			.register()
			.registerRunListener((args, state) => {
				return Tahoma.executeScenario(args.scenario.oid)
					.then(data => {
						return Promise.resolve();
					});
			})
			.getArgument('scenario')
			.registerAutocompleteListener((query, args) => {
				return Tahoma.getActionGroups()
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
						console.log(error.message, error.stack);
					});
			});
	}
}

module.exports = App;