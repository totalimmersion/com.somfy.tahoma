'use strict';

if (process.env.DEBUG === '1') {
    require('inspector').open(9222, '0.0.0.0', true)
}
const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');
const nodemailer = require("nodemailer");

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
        this.timerId = null;

        Homey.ManagerSettings.set('diagLog', "");
        Homey.ManagerSettings.set('logEnabled', false);
        let logData = [];
        Homey.ManagerSettings.set('diagLog', "");

        Homey.ManagerSettings.set('statusLogEnabled', false);
        Homey.ManagerSettings.set('statusLog', "");

        process.on('unhandledRejection', (reason, p) => {
            this.logError('Unhandled Rejection', {
                'message': reason,
                'stack': p
            });
        });

        Homey.on('unload', () => {
            if (this.timerId) {
                clearInterval(this.timerId);
            }
        });

        this.addScenarioActionListeners();

        if (!Homey.ManagerSettings.get('syncInterval')) {
            Homey.ManagerSettings.set('syncInterval', INITIAL_SYNC_INTERVAL);
        }

        Homey.ManagerSettings.on('set', (setting) => {
            if ((setting === 'syncInterval') || (setting === 'username') || (setting === 'password')){
                this.initSync();
            }
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
        let err = {
            message: error.message,
            stack: error.stack
        };

        let logData = Homey.ManagerSettings.get('errorLog');
        if (!Array.isArray(logData)) {
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

    logStates(txt){
        if (Homey.ManagerSettings.get('stateLogEnabled')) {
            let log = Homey.ManagerSettings.get('stateLog') + txt + "\n";
            Homey.ManagerSettings.set('stateLog', log);
        }
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

                return {
                    error: null,
                    message: "OK"
                };
            } catch (err) {
                this.logError("Send log error", err);
                return {
                    error: err,
                    message: null
                };
            };
        }
    }

    /**
     * Initializes synchronization between Homey and TaHoma
     * with the interval as defined in the settings.
     */
    initSync() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }

        const username = Homey.ManagerSettings.get('username');
        const password = Homey.ManagerSettings.get('password');
        if (!username || !password){
            return;
        }

        let interval = null;
        try {
            interval = Number(Homey.ManagerSettings.get('syncInterval'));
        } catch (e) {
            interval = INITIAL_SYNC_INTERVAL;
        }

        this.syncWithCloud(interval * 1000);
    }

    async syncWithCloud(interval) {
        try {
            let data = await Tahoma.setup();
            if (data.devices) {

                this.logDevices(data.devices);
                
                if (Homey.ManagerSettings.get('stateLogEnabled')) {
                    Homey.ManagerSettings.unset('stateLog');
                }
                
                const drivers = Homey.ManagerDrivers.getDrivers();
                for (const driver in drivers) {
                    Homey.ManagerDrivers.getDriver(driver).getDevices().forEach(device => {
                        try {
                            if (device.isReady()) {
                                device.sync(data.devices)
                            }
                        } catch (error) {
                            this.logError("Tahoma.setup", error);
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error.message, error.stack);
        }
        this.timerId = setTimeout(() => this.syncWithCloud(interval), interval);
    };

    /**
     * Adds a listener for flowcard scenario actions
     */
    addScenarioActionListeners() {
        /*** ADD FLOW ACTION LISTENERS ***/
        new Homey.FlowCardAction('activate_scenario')
            .register()
            .registerRunListener(args => {
                return Tahoma.executeScenario(args.scenario.oid)
            })
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