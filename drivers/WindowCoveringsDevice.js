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
    this.windowcoveringsStateMap = {
      up: 'open',
      idle: null,
      down: 'close'
    };

    this.registerCapabilityListener('windowcoverings_state', this.onCapabilityWindowcoveringsState.bind(this));
    super.onInit();
  }

  onCapabilityWindowcoveringsState(value, opts, callback) {
    var deviceData = this.getData();
    var oldWindowCoveringsState = this.getState().windowcoverings_state;
    if (oldWindowCoveringsState !== value) {
      if (value === 'idle' && this.getStoreValue('executionId')) {
        Tahoma.cancelExecution(this.getStoreValue('executionId'))
          .then(() => {
            //let's set the state to open, because Tahoma, doesn't have an idle state. If a blind isn't closed for 100%, the state will remain open.
            this.setCapabilityValue('windowcoverings_state', value);
            if (callback) callback(null, value);
          })
          .catch(error => {
            console.log(error.message, error.stack);
          });
      } else if(!(oldWindowCoveringsState === 'idle' && opts.fromCloudSync === true)) {
        const action = {
          name: this.windowcoveringsStateMap[value],
          parameters: []
        };

        if (!opts.fromCloudSync) {
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
  }

  /**
	 * Sync the state of the devices from the TaHoma cloud with Homey
	 * @param {Array} data - device data from all the devices in the TaHoma cloud
	 */
  sync(data) {
    const device = data.find(deviceHelper.isSameDevice(this.getData().id), this);

    if (device) {
      //device exists -> let's sync the state of the device
      const statesMap = {
        open: 'up',
        closed: 'down'
      };

      const states = device.states
        .filter(state => state.name === 'core:OpenClosedState' || state.name === 'core:ClosureState')
        .map(state => {
          return {
            name: state.name ===  'core:OpenClosedState' ? 'openClosedState' : 'closureState',
            value: statesMap[state.value] ? statesMap[state.value]: state.value
          };
        });

      const openClosedState = states.find(state => state.name === 'openClosedState');

      this.log(this.getName(), 'state', openClosedState.value);
      this.triggerCapabilityListener('windowcoverings_state', openClosedState.value, {
        fromCloudSync: true
      });
    } else {
      //device was not found in TaHoma response -> remove device from Homey
      this.setUnavailable(null);
    }
  }
}

module.exports = WindowCoveringsDevice;
