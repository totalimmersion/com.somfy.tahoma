'use strict';

var taHoma = require('./lib/tahoma');

module.exports = [
	{
		description: 'Authenticate TaHoma',
		method: 'POST',
		path: '/login/',
		fn: function(callback, args) {
			taHoma.login(args.body.username, args.body.password, function(err, result) {
				Homey.log(err, result);
				taHoma.setup(function(err, result) {

				});
				callback(null, result);
			});

			/*Homey.app.login(data => {
				Homey.log('Logging in...');
				callback(null, data);
			}).then(response => {
				Homey.manager('settings').set('username', data.username);
				Homey.manager('settings').set('password', data.password)
			});*/
		}

	}
];