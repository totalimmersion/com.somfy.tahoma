'use strict';

const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');
const syncManager = require('./lib/sync');

const INITIAL_SYNC_INTERVAL = 10; //interval of 10 seconds

/**
 * This class is the starting point of the app and initializes the neccessary
 * services, listeners, etc.
 * @extends {Homey.App}
 **/
class App extends Homey.App {

	/**
	 * Initializes the app
	 */
	onInit() {
		this.log(`${Homey.app.manifest.id} running...`);
		this.addScenarioActionListeners();

		if (!Homey.ManagerSettings.get('syncInterval')) {
			Homey.ManagerSettings.set('syncInterval', INITIAL_SYNC_INTERVAL);
		}

		Homey.ManagerSettings.on('set', (setting) => {
			if (setting === 'syncInterval') this.initSync();
		});
		Homey.on('settings.set', this.initSync);

		this.initSync();
	}

	/**
	 * Initializes synchronization between Homey and TaHoma
	 * with the interval as defined in the settings.
	 */
	initSync() {
		let interval = null;
		try {
			interval = Number(Homey.ManagerSettings.get('syncInterval'));
		} catch(e) {
			interval = INITIAL_SYNC_INTERVAL;
		}
		syncManager.init(interval * 1000);
	}

	/**
	 * Adds a listener for flowcard scenario actions
	 */
	addScenarioActionListeners() {
		/*** ADD FLOW ACTION LISTENERS ***/
		new Homey.FlowCardAction('activate_scenario')
			.register()
			.registerRunListener(args => {
				return Tahoma.executeScenario(args.scenario.oid)
					.then(() => {
						return Promise.resolve();
					});
			})
			.getArgument('scenario')
			.registerAutocompleteListener(query => {
				return Tahoma.getActionGroups()
					.then(data => {
						const scenarios = data
											.map(({ oid, label }) => ({ oid, name: label }))
											.filter(({ name }) => name.toLowerCase().indexOf(query.toLowerCase()) > -1);

						return Promise.resolve(scenarios);
					})
					.catch(error => {
						console.log(error.message, error.stack);
					});
			});
	}
}

module.exports = App;
