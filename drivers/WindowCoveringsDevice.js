'use strict';

const Device = require('./Device');
const Tahoma = require('../lib/Tahoma');
const deviceHelper = require('../lib/helper').Device;

/**
 * Base class for window coverings devices
 * @extends {Device}
 */
class WindowCoveringsDevice extends Device {

  onInit() {
    this.windowcoveringsActions = {
      up: 'open',
      idle: null,
      down: 'close'
    };

    this.windowcoveringsStatesMap = {
      open: 'up',
      closed: 'down'
    };

    // From Anders pull request
    this.closureActionName = 'setClosure';
    this.closureStateName = 'core:ClosureState';

    this.registerCapabilityListener('windowcoverings_state', this.onCapabilityWindowcoveringsState.bind(this));
    this.registerCapabilityListener('windowcoverings_set', this.onCapabilityWindowcoveringsSet.bind(this));
    super.onInit();
  }

  onCapabilityWindowcoveringsState(value, opts, callback) {
    const deviceData = this.getData();
    const oldWindowCoveringsState = this.getState().windowcoverings_state;
    if (oldWindowCoveringsState !== value) {
      if (value === 'idle' && this.getStoreValue('executionId') && !opts.fromCloudSync) {
        Tahoma.cancelExecution(this.getStoreValue('executionId'))
          .then(() => {
            //let's set the state to open, because Tahoma, doesn't have an idle state. If a blind isn't closed for 100%, the state will remain open.
            this.setCapabilityValue('windowcoverings_state', value);
            if (callback) callback(null, value);
          })
          .catch(error => {
            console.log(error.message, error.stack);
          });
      } else if(!opts.fromCloudSync) {
        const action = {
          name: this.windowcoveringsActions[value],
          parameters: []
        };

        Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action)
          .then(result => {
            this.setStoreValue('executionId', result.execId);
            this.setCapabilityValue('windowcoverings_state', value);
            if (callback) callback(null, value);
          })
          .catch(error => {
            console.log(error.message, error.stack);
          });
      } else {
        this.setCapabilityValue('windowcoverings_state', value);
      }
    }
  }

  onCapabilityWindowcoveringsSet(value, opts, callback) {
    const deviceData = this.getData();
    if (!opts.fromCloudSync) {
      const action = {
        name: this.closureActionName, // Anders pull request
        parameters: [Math.round((1-value)*100)]
      };
      Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action)
        .then(result => {
          this.setStoreValue('executionId', result.execId);
          this.setCapabilityValue('windowcoverings_set', value);
          if (callback) callback(null, value);
        })
        .catch(error => {
          console.log(error.message, error.stack);
        });
    } else {
      this.setCapabilityValue('windowcoverings_set', value);
    }
  }

  /**
	 * Sync the state of the devices from the TaHoma cloud with Homey
	 * @param {Array} data - device data from all the devices in the TaHoma cloud
	 */
  sync(data) {
    const device = data.find(deviceHelper.isSameDevice(this.getData().id), this);

    if (device) {
      //device exists -> let's sync the state of the device
      const states = device.states
      .filter(state => state.name === 'core:OpenClosedState' || state.name === this.closureStateName) // Anders pull request
      .map(state => {
          const value = this.windowcoveringsStatesMap[state.value] ? this.windowcoveringsStatesMap[state.value]: state.value;
          return {
            name: state.name ===  'core:OpenClosedState' ? 'openClosedState' : 'closureState',
            value
          };
        });

      const closureState = states.find(state => state.name === 'closureState');
      const openClosedState = states.find(state => state.name === 'openClosedState');
      openClosedState.value = (closureState.value !== 0 && closureState.value !== 100) ? 'idle' : openClosedState.value;
      this.log(this.getName(), 'state', openClosedState.value, closureState.value);
      this.triggerCapabilityListener('windowcoverings_state', openClosedState.value, {
        fromCloudSync: true
      });
      this.triggerCapabilityListener('windowcoverings_set', 1-(closureState.value/100), {
        fromCloudSync: true
      });
    } else {
      //device was not found in TaHoma response -> remove device from Homey
      this.setUnavailable(null);
    }
  }
}

module.exports = WindowCoveringsDevice;
