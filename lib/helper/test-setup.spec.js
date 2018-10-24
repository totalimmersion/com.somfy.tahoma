'use strict';

const sinon = require('sinon');

beforeEach(function () {
  this.sandbox = sinon.createSandbox();
  this.sandbox.sync = sinon.spy();

  const device = {
    name: 'device',
    sync: this.sandbox.sync
  };

  const driver = {
    getDevices: function() {
      return [device, device, device];
    }
  };

  this.sandbox.drivers = {
    driver1: driver,
    driver2: driver,
    driver3: driver
  };
});

afterEach(function () {
  this.sandbox.restore();
});
