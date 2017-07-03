"use strict";

const Log = require('homey-log').Log;
const flowManager = require('./lib/flow');

function init() {
	
	Homey.log(`${Homey.manifest.id} running...`);

	flowManager.init();
	
}

module.exports.init = init;