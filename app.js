"use strict";

const Homey = require('homey');
const syncManager = require('./lib/sync');

class App extends Homey.App {

	onInit() {		
		this.log(`${Homey.app.manifest.id} running...`);

		syncManager.init();
	}
}

module.exports = App;