'use strict';

const Homey = require('homey');
var taHoma = require('./lib/tahoma');

module.exports = [
	{
		description: 'Authenticate TaHoma',
		method: 'POST',
		path: '/login/',
		fn: function(callback, args) {
			taHoma.login(args.body.username, args.body.password, function(err, result) {
				//Homey.log(err, result);
				Homey.manager('settings').set('username', args.body.username);
				Homey.manager('settings').set('password', args.body.password);
				callback(null, result);
			});
		}
	}
];