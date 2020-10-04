'use strict';

const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');

module.exports = [{
    description: 'Authenticate TaHoma',
    method: 'POST',
    path: '/login/',
    fn: function (args, callback) {
      Homey.app.stopSync();
      Tahoma.logout()
        .then(result => {
          console.log("Logout OK", result);
        })
        .catch((err) => {
          console.log("Logout Failed", err);
        })
        .then(() => {
          setTimeout(() => {
            Tahoma.login(args.body.username, args.body.password, args.body.linkurl)
              .then(result => {
                Homey.ManagerSettings.set('username', args.body.username);
                Homey.ManagerSettings.set('password', args.body.password);
                Homey.ManagerSettings.set('linkurl', args.body.linkurl);

                let interval = null;
                try {
                  interval = Number(Homey.ManagerSettings.get('syncInterval'));
                } catch (e) {
                  interval = 10;
                }
                Homey.app.syncWithCloud(interval * 1000);

                callback(null, result);
              })
              .catch(error => {
                Homey.app.logError("API POST login", error);
                callback(error);
              });
          }, 1000);
        });
    }
  },
  {
    description: 'Log out of TaHoma',
    method: 'POST',
    path: '/logout/',
    fn: function (args, callback) {
      Homey.app.stopSync();
      Tahoma.logout()
        .then(result => {
          Homey.ManagerSettings.unset('username');
          Homey.ManagerSettings.unset('password');
          callback(null, result);
        })
        .catch(error => {
          Homey.app.logError("API POST logout", error);
          callback(error);
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