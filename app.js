'use strict';
if (process.env.DEBUG === '1')
{
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
class myApp extends Homey.App
{
    /**
     * Initializes the app
     */
    async onInit()
    {
        this.log(`${Homey.app.manifest.id} running...`);
        this.loggedIn = false;
        this.syncing = false;
        this.stoppingSync = false;
        this.timerId = null;
        this.boostTimerId = null;
        this.commandsQueued = 0;

        if (process.env.DEBUG === '1')
        {
            Homey.ManagerSettings.set('debugMode', true);
        }
        else
        {
            Homey.ManagerSettings.set('debugMode', false);
        }
        Homey.ManagerSettings.unset('errorLog'); // Clean out obsolete entry
        Homey.ManagerSettings.unset('diagLog');
        Homey.ManagerSettings.unset('logEnabled');

        Homey.ManagerSettings.set('deviceLog', "");
        Homey.ManagerSettings.set('infoLog', "");
        Homey.ManagerSettings.set('statusLogEnabled', false);
        Homey.ManagerSettings.set('statusLog', "");

        this.homeyHash = await Homey.ManagerCloud.getHomeyId();
        this.homeyHash = this.hashCode(this.homeyHash).toString();

        // Default to old login method if not already setup
        if (Homey.ManagerSettings.get('loginMethod') === null)
        {
            Homey.ManagerSettings.set('loginMethod', false);
        }

        this.infoLogEnabled = Homey.ManagerSettings.get('infoLogEnabled')
        if (this.infoLogEnabled === null)
        {
            this.infoLogEnabled = false;
            Homey.ManagerSettings.set('infoLogEnabled', this.infoLogEnabled);
        }

        this.pollingEnabled = Homey.ManagerSettings.get('pollingEnabled')
        if (this.pollingEnabled === null)
        {
            this.pollingEnabled = true;
            Homey.ManagerSettings.set('pollingEnabled', this.pollingEnabled);
        }

        if (!Homey.ManagerSettings.get('syncInterval'))
        {
            Homey.ManagerSettings.set('syncInterval', INITIAL_SYNC_INTERVAL);
        }
        try
        {
            this.interval = Number(Homey.ManagerSettings.get('syncInterval'));
            if (this.interval < MIN_SYNC_INTERVAL)
            {
                this.interval = MIN_SYNC_INTERVAL;
                Homey.ManagerSettings.set('syncInterval', this.interval);
            }
        }
        catch (e)
        {
            this.interval = INITIAL_SYNC_INTERVAL;
            Homey.ManagerSettings.set('syncInterval', this.interval);
        }

        var linkurl = Homey.ManagerSettings.get('linkurl');
        if (!linkurl)
        {
            linkurl = "default";
            Homey.ManagerSettings.set('linkurl', linkurl);
        }

        process.on('unhandledRejection', (reason, promise) =>
        {
            console.log('Unhandled Rejection at:', promise, 'reason:', reason);
            this.logInformation('Unhandled Rejection',
            {
                'message': promise,
                'stack': reason
            });
        });

        Homey.on('unload', async () =>
        {
            await this.logOut(false);
        });

        Homey.ManagerSettings.on('set', (setting) =>
        {
            if (setting === 'pollingEnabled')
            {
                this.pollingEnabled = Homey.ManagerSettings.get('pollingEnabled');

                if (this.pollingEnabled)
                {
                    this.restartSync();
                }
                else
                {
                    this.stopSync();
                }
            }
            else if (setting === 'syncInterval')
            {
                try
                {
                    this.interval = Number(Homey.ManagerSettings.get('syncInterval'));
                }
                catch (e)
                {
                    this.interval = INITIAL_SYNC_INTERVAL;
                    Homey.ManagerSettings.set('syncInterval', this.interval)
                }

                if (this.pollingEnabled)
                {
                    this.restartSync();
                }
            }
            else if (setting === 'infoLogEnabled')
            {
                this.infoLogEnabled = Homey.ManagerSettings.get('infoLogEnabled');
            }
        });

        // Setup the flow listeners
        this.addScenarioActionListeners();
        this.addPollingSpeedActionListeners();
        this.addPollingActionListeners();

        this.initSync();

        this.log(`${Homey.app.manifest.id} Initialised`);
    }

    hashCode(s)
    {
        for (var i = 0, h = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
        return h;
    }

    // Throws an exception if the login fails
    async newLogin(args)
    {
        await this.newLogin_2(args.body.username, args.body.password, args.body.linkurl, true);
    }

    // Throws an exception if the login fails
    async newLogin_2(username, password, linkurl, ignoreBlock)
    {
        // Stop the timer so periodic updates don't happen while changing login
        this.loggedIn = false;
        await this.stopSync();

        // make sure we logout from old method first
        await Tahoma.logout();

        // Allow a short delay before logging back in
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the last login method to use again
        //var loginMethod = Homey.ManagerSettings.get('loginMethod');

        var loginMethod = false; // Start with old method

        // Login with supplied credentials. An error is thrown if the login fails
        try
        {
            // Allow a short delay before logging back in
            await new Promise(resolve => setTimeout(resolve, 1000));
            await Tahoma.login(username, password, linkurl, loginMethod, ignoreBlock);
            this.loggedIn = true;
        }
        catch (error)
        {
            // Try other log in method
            loginMethod = !loginMethod;
        }

        if (!this.loggedIn)
        {
            // Try once more with the alternative method but let an error break us out of here
            await Tahoma.login(username, password, linkurl, loginMethod, ignoreBlock);
            this.loggedIn = true;
        }

        // All good so save the credentials
        Homey.ManagerSettings.set('username', username);
        Homey.ManagerSettings.set('password', password);
        Homey.ManagerSettings.set('linkurl', linkurl);
        Homey.ManagerSettings.set('loginMethod', loginMethod);

        if (this.pollingEnabled)
        {
            // Start collection data again
            if (this.infoLogEnabled)
            {
                this.logInformation("initSync",
                {
                    message: "Starting Event Polling",
                    stack: ""
                });
            }

            this.syncLoop(this.interval * 1000);
        }
        return true;
    }

    async logOut(ClearCredentials = true)
    {
        this.loggedIn = false;
        await Homey.app.stopSync();
        try
        {
            await Tahoma.logout();
            if (ClearCredentials)
            {
                Homey.ManagerSettings.unset('username');
                Homey.ManagerSettings.unset('password');
            }
        }
        catch (error)
        {
            throw (error);
        }
        return true;
    }

    async logDevices()
    {
        const devices = await Tahoma.getDeviceData();
        // Do a deep copy
        let logData = JSON.parse(JSON.stringify(devices));
        if (process.env.DEBUG !== '1')
        {
            let i = 1;
            logData.forEach(element =>
            {
                delete element["creationTime"];
                delete element["lastUpdateTime"];
                delete element["shortcut"];
                delete element["deviceURL"];
                delete element["placeOID"];
                element["oid"] = "temp" + i++;
            });
        }
        Homey.ManagerSettings.set('deviceLog',
        {
            "devices": logData
        });
        Homey.ManagerSettings.unset('sendLog');
    }

    logInformation(source, error)
    {
        console.log(source, error);

        let data = {
            message: error.message,
            stack: error.stack
        };
        let logData = Homey.ManagerSettings.get('infoLog');
        if (!Array.isArray(logData))
        {
            logData = [];
        }
        const nowTime = new Date(Date.now());
        logData.push(
        {
            'time': nowTime.toJSON(),
            'source': source,
            'data': data
        });
        if (logData.length > 100)
        {
            logData.splice(0, 1);
        }
        Homey.ManagerSettings.set('infoLog', logData);
    }

    logStates(txt)
    {
        // if (Homey.ManagerSettings.get('stateLogEnabled')) {
        //     let log = Homey.ManagerSettings.get('stateLog') + txt + "\n";
        //     Homey.ManagerSettings.set('stateLog', log);
        // }
    }

    logEvents(txt)
    {
        if (Homey.ManagerSettings.get('stateLogEnabled'))
        {
            let log = Homey.ManagerSettings.get('stateLog') + txt + "\n";
            if (log.length > 30000)
            {
                Homey.ManagerSettings.set('stateLogEnabled', false);
            }
            else
            {
                Homey.ManagerSettings.set('stateLog', log);
            }
        }
    }

    async sendLog(logType)
    {
        let tries = 5;
        console.log("Send Log");
        while (tries-- > 0)
        {
            try
            {
                let subject = "";
                let text = "";
                if (logType === 'infoLog')
                {
                    subject = "Tahoma Information log";
                    text = JSON.stringify(Homey.ManagerSettings.get('infoLog'), null, 2).replace(/\\n/g, ' \n           ');
                }
                else
                {
                    subject = "Tahoma device log";
                    text = JSON.stringify(Homey.ManagerSettings.get('deviceLog'), null, 2).replace(/\\n/g, '\n            ');
                }

                subject += "(" + this.homeyHash + " : " + Homey.manifest.version + ")";

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport(
                {
                    host: Homey.env.MAIL_HOST, //Homey.env.MAIL_HOST,
                    port: 465,
                    ignoreTLS: false,
                    secure: true, // true for 465, false for other ports
                    auth:
                    {
                        user: Homey.env.MAIL_USER, // generated ethereal user
                        pass: Homey.env.MAIL_SECRET // generated ethereal password
                    },
                    tls:
                    {
                        // do not fail on invalid certs
                        rejectUnauthorized: false
                    }
                });
                // send mail with defined transport object
                await transporter.sendMail(
                {
                    from: '"Homey User" <' + Homey.env.MAIL_USER + '>', // sender address
                    to: Homey.env.MAIL_RECIPIENT, // list of receivers
                    subject: subject, // Subject line
                    text: text // plain text body
                });
                return {
                    error: null,
                    message: "OK"
                };
            }
            catch (err)
            {
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
    async initSync()
    {
        const username = Homey.ManagerSettings.get('username');
        const password = Homey.ManagerSettings.get('password');
        const linkurl = Homey.ManagerSettings.get('linkurl');
        if (!username || !password)
        {
            return;
        }

        try
        {
            if (this.infoLogEnabled)
            {
                this.logInformation("initSync",
                {
                    message: "Starting",
                    stack: ""
                });
            }

            await this.newLogin_2(username, password, linkurl, false)
        }
        catch (error)
        {
            this.logInformation("initSync",
            {
                message: "Error",
                stack: error
            });

            var timeout = 5000;
            if (error === "Far Too many login attempts (blocked for 5 minutes)")
            {
                timeout = 300000;
            }
            else if (error === "Too many login attempts (blocked for 20 seconds)")
            {
                timeout = 20000;
            }

            // Try again later
            this.timerId = setTimeout(() => this.initSync(), timeout);
        }
    }

    // Boost the sync speed when a command is executed that has status feedback
    async boostSync()
    {
        this.commandsQueued++;

        if (this.boostTimerId)
        {
            clearTimeout(this.boostTimerId);
            this.boostTimerId = null;
        }

        // Set a time limit in case the command complete signal is missed
        this.boostTimerId = setTimeout(() => this.unBoostSync(true), 45000);

        if (this.infoLogEnabled)
        {
            this.logInformation("Boost Sync",
            {
                message: "Increased Polling",
                stack: { syncInterval: 3, queSize: this.commandsQueued }
            });
        }

        if (this.commandsQueued === 1)
        {
            await this.stopSync();

            if (!Tahoma.eventsRegistered())
            {
                // The events are not currently registered so do that now
                await Tahoma.getEvents();
            }

            // We can't run the sync loop from here so fire it from a timer
            this.timerId = setTimeout(() => this.syncLoop(3000), 1000);
        }
    }

    async unBoostSync(immediate = false)
    {
        if (this.infoLogEnabled)
        {
            this.logInformation("UnBoost Sync",
            {
                message: "Reverting to previous Polling ?",
                stack: { timeOut: immediate, pollingMode: this.pollingEnabled, syncInterval: this.interval, queSize: this.commandsQueued }
            });
        }

        if (immediate)
        {
            this.commandsQueued = 0;
        }

        if (this.commandsQueued > 0)
        {
            this.commandsQueued--;
        }

        if (this.commandsQueued === 0)
        {
            clearTimeout(this.boostTimerId);
            this.boostTimerId = null;
            if (this.pollingEnabled)
            {
                await this.restartSync();
            }
            else
            {
                await this.stopSync();
            }
        }
    }

    async stopSync()
    {
        if (this.timerId)
        {
            this.stoppingSync = this.syncing;
            clearTimeout(this.timerId);
            this.timerId = null;
            if (this.infoLogEnabled)
            {
                this.logInformation("stopSync",
                {
                    message: "Stopping Event Polling",
                    stack: ""
                });
            }
        }
    }

    async restartSync()
    {
        await this.stopSync();
        this.timerId = setTimeout(() => this.syncLoop(this.interval * 1000), this.interval * 1000);
    }

    // The main polling loop that fetches events and sends them to the devices
    async syncLoop(interval)
    {
        this.nextInterval = interval;
        if (this.loggedIn && !this.syncing)
        {
            this.syncing = true;

            if (this.timerId)
            {
                // make sure any existing timer is canceled
                clearTimeout(this.timerId);
                this.timerId = null;
            }

            try
            {
                const events = await Tahoma.getEvents();
                if ((events === null && this.boostTimerId === null) || events.length > 0)
                {
                    // If events === null and boosTimer !== null then refresh all the devices, but don't do that if the boost is on
                    console.log(events);
                    await this.syncEvents(events);
                }
            }
            catch (error)
            {
                this.logInformation("syncLoop",
                {
                    message: error.message,
                    stack: ""
                });

            }

            if (!this.stoppingSync)
            {
                // Setup timer for next sync
                this.timerId = setTimeout(() => this.syncLoop(this.nextInterval), this.nextInterval);
            }
            else
            {
                this.stoppingSync = false;
            }

            // Signal that the sync has completed
            this.syncing = false;
        }
    }

    // Pass the new events to each device so they can update their status
    async syncEvents(events)
    {
        try
        {
            if (events)
            {
                if (this.infoLogEnabled)
                {
                    this.logInformation("Device status update",
                    {
                        message: "Refreshing",
                        stack: events
                    });
                }

                this.logEvents(JSON.stringify(events, null, 2));
            }
            else if (this.infoLogEnabled)
            {
                this.logInformation("Device status update",
                {
                    message: "Renewing",
                    stack: events
                });
            }

            let promises = [];

            const drivers = Homey.ManagerDrivers.getDrivers();
            for (const driver in drivers)
            {
                Homey.ManagerDrivers.getDriver(driver).getDevices().forEach(device =>
                {
                    try
                    {
                        promises.push(device.syncEvents(events));
                    }
                    catch (error)
                    {
                        this.logInformation("Sync Devices", error);
                    }
                })
            }

            // Wait for all the checks to complete
            await Promise.allSettled(promises);

            if (this.infoLogEnabled)
            {
                this.logInformation("Device status update",
                {
                    message: "Complete",
                    stack: events
                });
            }
        }
        catch (error)
        {
            console.log(error.message, error.stack);
        }
    };

    /**
     * Adds a listener for flowcard scenario actions
     */
    addScenarioActionListeners()
    {
        /*** ADD FLOW ACTION LISTENERS ***/
        new Homey.FlowCardAction('activate_scenario').register().registerRunListener(args =>
        {
            return Tahoma.executeScenario(args.scenario.oid)
        }).getArgument('scenario').registerAutocompleteListener(query =>
        {
            return Tahoma.getActionGroups().then(data => data.map((
            {
                oid,
                label
            }) => (
            {
                oid,
                name: label
            })).filter((
            {
                name
            }) => name.toLowerCase().indexOf(query.toLowerCase()) > -1)).catch(error =>
            {
                this.logInformation("addScenarioActionListeners", error);
            });
        });
    }

    /**
     * Adds a listener for polling speed flowcard actions
     */
    addPollingSpeedActionListeners()
    {
        new Homey.FlowCardAction('set_polling_speed').register().registerRunListener(args =>
        {
            this.interval = args.syncSpeed;
            Homey.ManagerSettings.set('syncInterval', this.interval.toString());
            if (!this.pollingEnabled)
            {
                this.pollingEnabled = true;
                Homey.ManagerSettings.set('pollingEnabled', this.pollingEnabled);
            }

            if (this.commandsQueued > 0)
            {
                // Sync is currently boosted so don't make any changes now
                return;
            }

            return this.restartSync();
        })
    }

    /**
     * Adds a listener for polling mode flowcard actions
     */
    addPollingActionListeners()
    {
        new Homey.FlowCardAction('set_polling_mode').register().registerRunListener(args =>
        {
            this.pollingEnabled = args.newPollingMode === 'on';
            Homey.ManagerSettings.set('pollingEnabled', this.pollingEnabled);

            if (this.commandsQueued > 0)
            {
                // Sync is currently boosted so don't make any changes now
                return;
            }

            if (this.pollingEnabled)
            {
                return this.restartSync();
            }
            else
            {
                return this.stopSync();
            }
        })
    }
}
module.exports = myApp;