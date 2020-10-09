'use strict';

const Homey = require('homey');
const Tahoma = require('../lib/Tahoma');

/**
 * Base class for drivers
 * @class
 * @extends {Homey.Driver}
 */
class Driver extends Homey.Driver {

  onPair(socket) {
    socket
      .on('list_devices', (data, callback) => {
        this.log('list_devices');
        const username = Homey.ManagerSettings.get('username');
        const password = Homey.ManagerSettings.get('password');
        if (!username || !password) {
          callback(new Error(Homey.__("errors.on_pair_login_failure")));
          return;
        }

        this.onReceiveSetupData(callback);
      })
  }

  async onReceiveSetupData(callback) {
    try {
      const devices = await Tahoma.getDeviceData();
      if (devices) {
        this.log('setup resolve');
        const homeyDevices = devices
          .filter(device => this.deviceType.indexOf(device.controllableName) !== -1)
          .map(device => ({
            name: device.label,
            data: {
              id: device.oid,
              deviceURL: device.deviceURL,
              label: device.label,
              controllableName: device.controllableName
            }
          }));

        callback(null, homeyDevices);
      }
    } catch (error) {
      Homey.app.logError("OnReceiveSetupData", error);
      callback(error);
    }
  }

  /**
   * Triggers a flow
   * @param {Homey.FlowCardTriggerDevice} trigger - A Homey.FlowCardTriggerDevice instance
   * @param {Device} device - A Device instance
   * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
   * @param {Object} state - An object with properties which are accessible throughout the Flow
   */
  triggerFlow(trigger, device, tokens, state) {
    if (trigger) {
      trigger
        .trigger(device, tokens, state)
        .then(this.log)
        .catch(error => {
          Homey.app.logError("triggerFlow", error);
        });
    }
  }

  /**
   * Returns the io controllable name(s) of TaHoma
   * @return {Array} deviceType
   */
  getDeviceType() {
    return this.deviceType ? this.deviceType : false;
  }
}

module.exports = Driver;