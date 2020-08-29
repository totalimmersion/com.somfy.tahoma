'use strict';

const SensorDevice = require('../SensorDevice');
const Tahoma = require('../../lib/Tahoma');

/**
 * Device class for the opening detector with the io:SomfyContactIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */

class OneAlarmDevice extends SensorDevice {
    onInit() {
        super.onInit();
        this.alarmArmedState = {
            armed: 'armed',
            disarmed: 'disarmed',
            partial: 'partially_armed'
        };

        this.alarmTriggeredStatesMap = {
            detected: 'detected',
            notDetected: 'notDetected'
        };

        this.registerCapabilityListener('homealarm_state', this.onCapabilityAlarmArmedState.bind(this));
        this.registerCapabilityListener('alarm_generic', this.onCapabilityAlarmTriggeredState.bind(this));
    }

    onCapabilityAlarmTriggeredState(value) {
        const oldTriggeredState = this.getState().alarm_generic;
        if (oldTriggeredState !== value) {
            this.setCapabilityValue('alarm_generic', value);

            const device = this;
            const tokens = {
                'isTriggered': value
            };

            const state = {
                'alarm_generic': value
            };
        }

        return Promise.resolve();
    }

    onCapabilityAlarmArmedState(value, opts, callback) {
        const deviceData = this.getData();
        if (!opts.fromCloudSync) {
            var action;
            if (value == 'armed') {
                action = {
                    name: 'arm',
                    parameters: []
                };
            }
            if (value == 'disarmed') {
                action = {
                    name: 'disarm',
                    parameters: []
                };
            }
            if (value == 'partially_armed') {
                action = {
                    name: 'partial',
                    parameters: []
                };
            }
            Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action)
                .then(result => {
                    this.setStoreValue('executionId', result.execId);
                    this.setCapabilityValue('homealarm_state', value);
                    if (callback) callback(null, value);
                })
                .catch(error => {
                    Homey.app.logError("onCapabilityAlarmArmedState", error);
                });
        } else {
            this.setCapabilityValue('homealarm_state', value);
        }

        return Promise.resolve();
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     * @param {Array} data - device data from all the devices in the TaHoma cloud
     */
    sync(data) {
        let thisId = this.getData().id;
        const device = data.find(device => device.oid === thisId);

        if (!device) {
            this.setUnavailable(null);
            return;
        }

        if (device.states) {
            const intrusionState = device.states.find(state => state.name === 'core:IntrusionState');
            if (intrusionState) {
                this.log(this.getName(), intrusionState.value);
                this.triggerCapabilityListener('alarm_generic', intrusionState.value === 'detected');
            }

            const alarmStatusState = device.states.find(state => state.name === 'myfox:AlarmStatusState');
            if (alarmStatusState) {
                this.log(this.getName(), alarmStatusState.value);
                this.triggerCapabilityListener('homealarm_state', this.alarmArmedState[alarmStatusState.value], {
                    fromCloudSync: true
                });
            }
        }
    }
}

module.exports = OneAlarmDevice;