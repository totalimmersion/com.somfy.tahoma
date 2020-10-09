'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the light controller with the myfox:LightController controllable name in TaHoma
 * @extends {SensorDevice}
 */

class myFoxLightControllerDevice extends SensorDevice {
    async onInit() {
        await super.onInit();
        this.lightState = {
            off: false,
            on: true
        };

        this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
    }

    onCapabilityOnOff(value, opts, callback) {
        const deviceData = this.getData();
        if (!opts || !opts.fromCloudSync) {
            var action;
            if (value == false) {
                action = {
                    name: 'off',
                    parameters: []
                };
            } else {
                action = {
                    name: 'on',
                    parameters: []
                };
            }
            Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action)
                .then(result => {
                    this.setStoreValue('executionId', result.execId);
                    this.setCapabilityValue('onoff', (value == true));
                    if (callback) callback(null, value);
                })
                .catch(error => {
                    Homey.app.logInformation(this.getName() + ": onCapabilityOnOff", error);
                });
        } else {
            this.setCapabilityValue('onoff', (value == true));
        }

        //return Promise.resolve();
    }

    /**
     * Gets the data from the TaHoma cloud
     */
    async sync() {
        try {
            const states = await super.sync();
            if (states) {
                const OnOffState = states.find(state => state.name === 'core:OnOffState');
                if (OnOffState) {
                    Homey.app.logStates(this.getName() + ": core:OnOffState = " + OnOffState.value);
                    this.triggerCapabilityListener('onoff', (OnOffState.value === 'on'), {
                        fromCloudSync: true
                    });
                }
            }
        } catch (error) {
            this.setUnavailable(null);
            Homey.app.logInformation(this.getName(), {
                message: error.message,
                stack: error.stack
            });
        }
    }

	// look for updates in the events array
	async syncEvents(events) {
		const myURL = this.getDeviceUrl();

		// Process events sequentially so they are in the correct order
		for (var i = 0; i < events.length; i++) {
			const element = events[i];
			if (element['name'] === 'DeviceStateChangedEvent') {
				if ((element['deviceURL'] === myURL) && element['deviceStates']) {
					// Got what we need to update the device so lets find it
					for (var x = 0; x < element.deviceStates.length; x++) {
						const deviceState = element.deviceStates[x];
						if (deviceState.name === 'core:OnOffState') {
							Homey.app.logStates(this.getName() + ": core:OnOffState = " + deviceState.value);
							const oldState = this.getState().onoff;
							if (oldState !== deviceState.value) {
								this.triggerCapabilityListener('onoff', (deviceState.value  === 'on'));
							}
						}
					}
				}
			}
		}
	}
}

module.exports = myFoxLightControllerDevice;