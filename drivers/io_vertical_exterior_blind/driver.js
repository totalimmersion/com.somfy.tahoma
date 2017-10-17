"use strict";

const Homey = require('homey');
const Driver = require('../../lib/Driver');
const taHoma = require('../../lib/tahoma');

var windowcoveringsStateMap = {
	up: 'open',
	idle: null,
	down: 'close'
};

//Driver for a io:VerticalExteriorAwningIOComponent device
class VerticalExteriorBlindDriver extends Driver {

	onInit() {
		/*** ADD FLOW ACTION LISTENERS ***/
		new Homey.FlowCardAction('activate_scenario')
			.register()
			.registerRunListener((args, state) => {
				return taHoma.executeScenario(args.scenario.oid)
					.then(data => {
						return Promise.resolve(true);
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

	_onPairListDevices(state, data, callback) {

		taHoma.setup(function(err, data) {
			if (err) {
				return callback(err);
			}
			if (data && data.devices) {
				var blinds = new Array();
				for (var i=0; i<data.devices.length; i++) {
					var device = data.devices[i];
					if (device.controllableName == 'io:VerticalExteriorAwningIOComponent') {
						var device_data = {
							name: device.label,
							data: {
								id: device.oid,
								deviceURL: device.deviceURL,
								label: device.label
							}
						};
						blinds.push(device_data);
					}
				}

				callback(null, blinds);
			}
		});

	}
}

module.exports = VerticalExteriorBlindDriver;