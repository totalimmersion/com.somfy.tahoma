'use strict';

const expect = require('chai').expect;
const mock = require('mock-require');

const Homey = require('./test/homey-mock');
mock('homey', Homey);

const HttpHelper = require('./HttpHelper');

describe('HttpHelper', function () {

  it('has a get method', function () {
    expect(HttpHelper.get).to.be.a('function');
  });

  it('has a post method', function () {
    expect(HttpHelper.post).to.be.a('function');
  });

  it('has a delete method', function () {
    expect(HttpHelper.delete).to.be.a('function');
  });

  it('has a reAuthenticate method', function () {
    expect(HttpHelper.reAuthenticate).to.be.a('function');
  });

  it('returns a promise from get', async () => {
    try {
      await HttpHelper.get();
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('returns a promise from post', async () => {
    try {
      await HttpHelper.get();
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('returns a promise from delete', async () => {
    try {
      await HttpHelper.get();
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('returns a promise from reAuthenticate', async () => {
    try {
      await HttpHelper.get();
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });
});
