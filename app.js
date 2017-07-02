"use strict";

const Log = require('homey-log').Log;

function init() {
	
	Homey.log(`${Homey.manifest.id} running...`);
	
}

module.exports.init = init;