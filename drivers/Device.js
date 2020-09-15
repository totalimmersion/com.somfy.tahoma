'use strict';

const Homey = require('homey');

/**
 * Base class for devices
 * @extends {Homey.Device}
 */
class Device extends Homey.Device {

  async onInit() {
    this._ready = false;
    this.log('Device init:', this.getName(), 'class:', this.getClass());

    setTimeout(() => {this._ready = true}, Math.floor(Math.random() * 5000));
  }

  onAdded() {
    this.log('device added');
  }

  onDeleted() {
    this.log('device deleted');
  }

  /**
   * Returns the TaHoma device url
   * @return {String}
   */
  getDeviceUrl() {
    return this.getData().deviceURL;
  }

  /**
   * Returns the io controllable name(s) of TaHoma
   * @return {Array} deviceType
   */
  getDeviceType() {
    return this.getDriver().getDeviceType();
  }

  isReady(){
    return this._ready;
  }

  async sync() {
    throw new Error('sync() not implemented for device');
  }
}

module.exports = Device;