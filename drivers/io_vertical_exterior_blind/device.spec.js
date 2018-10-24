'use strict';

const expect = require('chai').expect;
const mock = require('mock-require');

const Homey = require('../../lib/test/homey-mock');
mock('homey', Homey);

const Device = require('./device');

describe('VerticalExteriorBlindDevice', function() {
  const device = new Device();
  it('should implement the sync() method', function() {
    expect(() => device.sync([])).to.not.throw();
  });
});
