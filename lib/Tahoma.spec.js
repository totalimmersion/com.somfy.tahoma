'use strict';

const expect = require('chai').expect;
const mock = require('mock-require');

const Homey = require('./test/homey-mock');
mock('homey', Homey);

const Tahoma = require('./Tahoma');

describe('Tahoma client', function() {

  it('has a login method', function() {
    expect(Tahoma.login).to.be.a('function');
  });

  it('makes a login request', function(done) {
    this.timeout(5000);
    Tahoma.login('username', 'password')
      .then(result => {
        expect(result).to.be.an('object');
        done();
      })
      .catch(error => {
        expect(error).to.be.null;
        done();
      });
  });

  it('has a logout method', function() {
    expect(Tahoma.logout).to.be.a('function');
  });

  it('makes a logout request', function(done) {
    this.timeout(5000);
    Tahoma.logout()
      .then(result => {
        expect(result).to.be.an('object');
        done();
      })
      .catch(error => {
        expect(error).to.be.null;
        done();
      });
  });
});
