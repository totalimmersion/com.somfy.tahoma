'use strict';

if (process.env.DEBUG === '1') {
    require('inspector').open(9222, '0.0.0.0', true)
}
const Homey = require('homey');
const Tahoma = require('./lib/Tahoma');
const nodemailer = require("nodemailer");

const INITIAL_SYNC_INTERVAL = 30; //interval of 30 seconds
const MIN_SYNC_INTERVAL = 10;

/**
 * This class is the starting point of the app and initializes the necessary
 * services, listeners, etc.
 * @extends {Homey.App}
 **/
class myApp extends Homey.App {

    /**
     * Initializes the app
     */
    async onInit() {
        this.log(`${Homey.app.manifest.id} running...`);
        this.loggedIn = false;
        this.syncing = false;
        this.timerId = null;

        if (process.env.DEBUG === '1') {
            Homey.ManagerSettings.set('debugMode', true);
        } else {
            Homey.ManagerSettings.set('debugMode', false);
        }

        Homey.ManagerSettings.set('diagLog', "");
        Homey.ManagerSettings.set('logEnabled', false);
        Homey.ManagerSettings.set('errorLog', ""); // Clean out obsolete entry
        Homey.ManagerSettings.set('infoLog', "");

        //Homey.ManagerSettings.set('statusLogEnabled', false);
        Homey.ManagerSettings.set('statusLog', "");

        this.homeyHash = await Homey.ManagerCloud.getHomeyId();
        this.homeyHash = this.hashCode(this.homeyHash).toString();

        this.infoLogEnabled = Homey.ManagerSettings.get('infoLogEnabled')
        if (this.infoLogEnabled === null) {
            this.infoLogEnabled = false;
            Homey.ManagerSettings.set('infoLogEnabled', this.infoLogEnabled);
        }

        if (!Homey.ManagerSettings.get('syncInterval')) {
            Homey.ManagerSettings.set('syncInterval', INITIAL_SYNC_INTERVAL);
        }
        try {
            this.interval = Number(Homey.ManagerSettings.get('syncInterval'));
            if (this.interval < MIN_SYNC_INTERVAL) {
                this.interval = MIN_SYNC_INTERVAL;
                Homey.ManagerSettings.set('syncInterval', this.interval);
            }
        } catch (e) {
            this.interval = INITIAL_SYNC_INTERVAL;
            Homey.ManagerSettings.set('syncInterval', this.interval);
        }

        var linkurl = Homey.ManagerSettings.get('linkurl');
        if (!linkurl) {
            linkurl = "default";
            Homey.ManagerSettings.set('linkurl', linkurl);
        }

        process.on('unhandledRejection', (reason, promise) => {
            console.log('Unhandled Rejection at:', promise, 'reason:', reason);
            this.logInformation('Unhandled Rejection', {
                'message': promise,
                'stack': reason
            });
        });

        Homey.on('unload', () => {
            if (this.timerId) {
                clearInterval(this.timerId);
            }
        });

        Homey.ManagerSettings.on('set', (setting) => {
            if (setting === 'syncInterval') {
                try {
                    this.interval = Number(Homey.ManagerSettings.get('syncInterval'));
                } catch (e) {
                    this.interval = INITIAL_SYNC_INTERVAL;
                    Homey.ManagerSettings.set('syncInterval', this.interval)
                }

                this.restartSync();
            } else if (setting === 'infoLogEnabled') {
                this.infoLogEnabled = Homey.ManagerSettings.get('infoLogEnabled');
            }
        });

        this.addScenarioActionListeners();
        this.initSync();
        this.log(`${Homey.app.manifest.id} Initialised`);
    }

    hashCode(s) {
        for (var i = 0, h = 0; i < s.length; i++)
            h = Math.imul(31, h) + s.charCodeAt(i) | 0;
        return h;
    }

    // Throws an exception if the login fails
    async newLogin(args) {

        // Stop the timer so periodic updates don't happen while changing login
        this.loggedIn = false;
        await this.stopSync();

        // make sure we logout from old method first
        await Tahoma.logout();

        // Allow s short delay before loging back in
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Login with supplied credentials. An error is thrown if the login fails
        try {
            await Tahoma.login(args.body.username, args.body.password, args.body.linkurl, args.body.loginMethod);

            // All good so save the credentials
            Homey.ManagerSettings.set('username', args.body.username);
            Homey.ManagerSettings.set('password', args.body.password);
            Homey.ManagerSettings.set('linkurl', args.body.linkurl);
            Homey.ManagerSettings.set('loginMethod', args.body.loginMethod);
            this.loggedIn = true;
            this.log(`${Homey.app.manifest.id} Logged in`);

            // Start collection data again
            this.syncWithCloud(this.interval * 1000);
        } catch (error) {
            throw (error);
        }
        return true;
    }

    async logOut() {
        this.loggedIn = false;
        await Homey.app.stopSync();
        try {
            await Tahoma.logout();
            Homey.ManagerSettings.unset('username');
            Homey.ManagerSettings.unset('password');
        } catch (error) {
            throw (error);
        }
        return true;
    }

    async logDevices() {
        const devices = await Tahoma.getDeviceData();
        // Do a deep copy
        let logData = JSON.parse(JSON.stringify(devices));
        if (process.env.DEBUG !== '1') {

            let i = 1;
            logData.forEach(element => {
                delete element["creationTime"];
                delete element["lastUpdateTime"];
                delete element["shortcut"];
                delete element["deviceURL"];
                delete element["placeOID"];
                element["oid"] = "temp" + i++;
            });
        }
        Homey.ManagerSettings.set('diagLog', {
            "devices": logData
        });
        Homey.ManagerSettings.unset('sendLog');
    }

    logInformation(source, error) {
        if (this.infoLogEnabled) {
            console.log(source, error);
            let data = {
                message: error.message,
                stack: error.stack
            };

            let logData = Homey.ManagerSettings.get('infoLog');
            if (!Array.isArray(logData)) {
                logData = [];
            }
            const nowTime = new Date(Date.now());
            logData.push({
                'time': nowTime.toJSON(),
                'source': source,
                'data': data
            });
            if (logData.length > 50) {
                logData.splice(0, 1);
            }
            Homey.ManagerSettings.set('infoLog', logData);
        }
    }

    logStates(txt) {
        // if (Homey.ManagerSettings.get('stateLogEnabled')) {
        //     let log = Homey.ManagerSettings.get('stateLog') + txt + "\n";
        //     Homey.ManagerSettings.set('stateLog', log);
        // }
    }

    logEvents(txt) {
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
                if (logType === 'infoLog') {
                    subject = "Tahoma Information log";
                    text = JSON.stringify(Homey.ManagerSettings.get('infoLog'), null, 2).replace(/\\n/g, ' \n           ');
                } else {
                    subject = "Tahoma device log";
                    text = JSON.stringify(Homey.ManagerSettings.get('diagLog'), null, 2).replace(/\\n/g, '\n            ');
                }

                subject += "(" + this.homeyHash + " : " + Homey.manifest.version + ")";

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
                this.logInformation("Send log error", err);
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
    async initSync() {
        await this.stopSync();

        const username = Homey.ManagerSettings.get('username');
        const password = Homey.ManagerSettings.get('password');
        if (!username || !password) {
            return;
        }

        try {
            this.logInformation("initSync", {
                message: "Starting",
                stack: ""
            });

            await Tahoma.login(username, password, Homey.ManagerSettings.get('linkurl'), Homey.ManagerSettings.get('loginMethod'));
            this.loggedIn = true;
            this.logInformation("initSync", {
                message: "Logged in",
                stack: ""
            });

            this.logInformation("initSync", {
                message: "Starting Event Polling",
                stack: ""
            });

            // Start to Sync devices that have had an event
            this.syncWithCloud(this.interval * 1000);
        } catch (error) {
            this.logInformation("initSync", {
                message: "Error",
                stack: error
            });

            // Try again later
            this.timerId = setTimeout(() => this.initSync(), 2000);
        }
    }

    async stopSync() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;

            this.logInformation("stopSync", {
                message: "Stopping Event Polling",
                stack: ""
            });
        }
        while (this.syncing) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async restartSync() {
        await this.stopSync();
        this.syncWithCloud(this.interval * 1000);
    }

    async syncWithCloud(interval) {
        try {
            if (this.loggedIn) {
                this.syncing = true;

                const events = await Tahoma.getEvents();
                if (events.length > 0) {
                    console.log(events);
                    await this.syncEvents(events);
                }
            }
        } catch (error) {

        }

        this.syncing = false;

        if (this.loggedIn) {
            this.timerId = setTimeout(() => this.syncWithCloud(interval), interval);
        }
    }

    async syncEvents(events) {
        try {
            this.logEvents(JSON.stringify(events, null, 2));

            const drivers = Homey.ManagerDrivers.getDrivers();
            for (const driver in drivers) {
                Homey.ManagerDrivers.getDriver(driver).getDevices().forEach(device => {
                    try {
                        device.syncEvents(events);
                    } catch (error) {
                        this.logInformation("Sync Devices", error);
                    }
                })
            }
        } catch (error) {
            console.log(error.message, error.stack);
        }
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
                        this.logInformation("addScenarioActionListeners", error);
                    });
            });
    }

}

module.exports = myApp;