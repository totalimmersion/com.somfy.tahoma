"use strict";

const Homey = require('homey');
const flowManager = require('./lib/flow');
const syncManager = require('./lib/sync');

class App extends Homey.App {

	onInit() {
		
		this.log(`${Homey.app.manifest.id} running...`);

		flowManager.init();
		syncManager.init();
	}
}

module.exports = App;