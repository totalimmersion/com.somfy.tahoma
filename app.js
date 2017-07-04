"use strict";

const flowManager = require('./lib/flow');
const syncManager = require('./lib/sync');

function init() {
	
	Homey.log(`${Homey.manifest.id} running...`);

	flowManager.init();
	syncManager.init();
}

module.exports.init = init;