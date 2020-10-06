'use strict';

const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');

module.exports = [{
    description: 'Authenticate TaHoma',
    method: 'POST',
    path: '/login/',
    fn: function (args, callback) {
      Homey.app.newLogin(args)
        .then(result => {
          callback(null, result);
        })
        .catch(error => {
          Homey.app.logError("API POST login", error);
          callback(error);
        });
    }
  },
  {
    description: 'Log out of TaHoma',
    method: 'POST',
    path: '/logout/',
    fn: function (args, callback) {
      Homey.app.logOut()
        .then(result => {
          callback(null, result);
        })
        .catch(error => {
          Homey.app.logError("API POST logout", error);
          callback(error);
        });
    }
  },
  {
    description: 'Get device log',
    method: 'POST',
    path: '/GetDeviceLog/',
    fn: function (args, callback) {
      Homey.app.logDevices()
        .then(result => {
          return callback(null, true);
        })
        .catch(error => {
          return callback(error, null);
        });
    }
  },
  {
    description: 'Send device log',
    method: 'POST',
    path: '/SendDeviceLog/',
    fn: function (args, callback) {
      Homey.app.sendLog('deviceLog')
        .then(result => {
          return callback(result.error, result.message);
        })
        .catch(error => {
          return callback(error, null);
        });
    }
  },
  {
    description: 'Send error log',
    method: 'POST',
    path: '/SendErrorLog/',
    fn: function (args, callback) {
      Homey.app.sendLog('errorLog')
        .then(result => {
          return callback(result.error, result.message);
        })
        .catch(error => {
          return callback(error, null);
        });
    }
  }
];