'use strict';

if (process.env.DEBUG === '1') {
    require('inspector').open(9222, '0.0.0.0', false)
}

const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');
const syncManager = require('./lib/sync');
const nodemailer = require("nodemailer");
const { isArray } = require('util');

const INITIAL_SYNC_INTERVAL = 10; //interval of 10 seconds

/**
 * This class is the starting point of the app and initializes the necessary
 * services, listeners, etc.
 * @extends {Homey.App}
 **/
class myApp extends Homey.App {

    /**
     * Initializes the app
     */
    onInit() {
        this.log(`${Homey.app.manifest.id} running...`);
        Homey.ManagerSettings.set('diagLog', "");
        Homey.ManagerSettings.set('logEnabled', false);
        let logData = [];
        Homey.ManagerSettings.set('errorLog', logData);

        process.on('unhandledRejection', (reason, p) => {

            this.logError('Unhandled Rejection', {
                'reason': reason,
                'promise': p
            });
        });

        this.addScenarioActionListeners();

        if (!Homey.ManagerSettings.get('syncInterval')) {
            Homey.ManagerSettings.set('syncInterval', INITIAL_SYNC_INTERVAL);
        }

        Homey.ManagerSettings.on('set', (setting) => {
            if (setting === 'syncInterval') this.initSync();
        });

        Homey.on('settings.set', this.initSync);

        this.initSync();
    }

    logDevices(devices) {
        if (Homey.ManagerSettings.get('logEnabled')) {
            // Do a deep copy
            let logData = JSON.parse(JSON.stringify(devices));
            let i = 1;
            logData.forEach(element => {
                delete element["creationTime"];
                delete element["lastUpdateTime"];
                delete element["shortcut"];
                delete element["deviceURL"];
                delete element["placeOID"];
                element["oid"] = "temp" + i++;
            });
            Homey.ManagerSettings.set('diagLog', {
                "devices": logData
            });
            Homey.ManagerSettings.set('logEnabled', false);
            Homey.ManagerSettings.unset('sendLog');
        }
    }

    logError(source, error) {
        console.log(source, error);
        let err = {message: error.message, stack: error.stack};

        let logData = Homey.ManagerSettings.get('errorLog');
        if (!Array.isArray(logData))
        {
            logData = [];
        }
        logData.push({
            'source': source,
            'error': err
        });
        if (logData.length > 50) {
            logData.splice(0, 1);
        }
        Homey.ManagerSettings.set('errorLog', logData);
    }

    async sendLog(logType) {
        let tries = 5;
        console.log("Send Log");

        while (tries-- > 0) {
            try {
                let subject = "";
                let text = "";
                if (logType === 'errorLog') {
                    subject = "Tahoma error log";
                    text = JSON.stringify(Homey.ManagerSettings.get('errorLog'), null, 2);
                } else {
                    subject = "Tahoma device log";
                    text = JSON.stringify(Homey.ManagerSettings.get('diagLog'), null, 2);
                }
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: Homey.env.MAIL_HOST, //Homey.env.MAIL_HOST,
                    port: 465,
                    ignoreTLS: false,
                    secure: true, // true for 465, false for other ports
                    auth: {
                        user: Homey.env.MAIL_USER, // generated ethereal user
                        pass: Homey.env.MAIL_SECRET // generated ethereal password
                    },
                    tls: {
                        // do not fail on invalid certs
                        rejectUnauthorized: false
                    }
                });

                // send mail with defined transport object
                await transporter.sendMail({
                    from: '"Homey User" <' + Homey.env.MAIL_USER + '>', // sender address
                    to: Homey.env.MAIL_RECIPIENT, // list of receivers
                    subject: subject, // Subject line
                    text: text // plain text body
                });

                return {error: null, message: "OK"};
            } catch (err) {
                this.logError("Send log error", err);
                return {error: err, message: null};
            };
        }
    }

    /**
     * Initializes synchronization between Homey and TaHoma
     * with the interval as defined in the settings.
     */
    initSync() {
        let interval = null;
        try {
            interval = Number(Homey.ManagerSettings.get('syncInterval'));
        } catch (e) {
            interval = INITIAL_SYNC_INTERVAL;
        }
        syncManager.init(interval * 1000);
    }

    /**
     * Adds a listener for flowcard scenario actions
     */
    addScenarioActionListeners() {
        /*** ADD FLOW ACTION LISTENERS ***/
        new Homey.FlowCardAction('activate_scenario')
            .register()
            .registerRunListener(args => {return Tahoma.executeScenario(args.scenario.oid)})
            .getArgument('scenario')
            .registerAutocompleteListener(query => {
                return Tahoma.getActionGroups()
                    .then(data => data
                        .map(({
                            oid,
                            label
                        }) => ({
                            oid,
                            name: label
                        }))
                        .filter(({
                            name
                        }) => name.toLowerCase().indexOf(query.toLowerCase()) > -1))
                    .catch(error => {
                        this.logError("addScenarioActionListeners", error);
                    });
            });
    }

}

module.exports = myApp;