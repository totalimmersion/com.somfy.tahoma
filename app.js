/* jslint node: true */

'use strict';

if (process.env.DEBUG === '1')
{
    // eslint-disable-next-line node/no-unsupported-features/node-builtins, global-require
    require('inspector').open(9223, '0.0.0.0', true);
}

const Homey = require('homey');
const nodemailer = require('nodemailer');
const Tahoma = require('./lib/Tahoma');

const INITIAL_SYNC_INTERVAL = 60; // interval of 60 seconds
const MIN_SYNC_INTERVAL = 30;
class myApp extends Homey.App
{

    /**
     * Initializes the app
     */
    async onInit()
    {
        this.log(`${Homey.manifest.id} running...`);
        this.loggedIn = false;
        this.syncing = false;
        this.timerId = null;
        this.boostTimerId = null;
        this.unBoostTimerID = null;
        this.unBoosting = false;
        this.commandsQueued = 0;
        this.lastSync = 0;

        if (process.env.DEBUG === '1')
        {
            this.homey.settings.set('debugMode', true);
        }
        else
        {
            this.homey.settings.set('debugMode', false);
        }
        this.homey.settings.unset('errorLog'); // Clean out obsolete entry
        this.homey.settings.unset('diagLog');
        this.homey.settings.unset('logEnabled');

        this.homey.settings.set('deviceLog', '');
        this.homey.settings.set('infoLog', '');
        this.homey.settings.set('statusLogEnabled', false);
        this.homey.settings.set('statusLog', '');

        this.homeyHash = await this.homey.cloud.getHomeyId();
        this.homeyHash = this.hashCode(this.homeyHash).toString();

        // Default to old login method if not already setup
        if (this.homey.settings.get('loginMethod') === null)
        {
            this.homey.settings.set('loginMethod', false);
        }

        this.infoLogEnabled = this.homey.settings.get('infoLogEnabled');
        if (this.infoLogEnabled === null)
        {
            this.infoLogEnabled = false;
            this.homey.settings.set('infoLogEnabled', this.infoLogEnabled);
        }

        this.eventLogEnabled = this.homey.settings.get('eventLogEnabled');
        if (this.eventLogEnabled === null)
        {
            this.eventLogEnabled = false;
            this.homey.settings.set('eventLogEnabled', this.eventLogEnabled);
        }

        this.pollingEnabled = this.homey.settings.get('pollingEnabled');
        if (this.pollingEnabled === null)
        {
            this.pollingEnabled = true;
            this.homey.settings.set('pollingEnabled', this.pollingEnabled);
        }

        if (!this.homey.settings.get('syncInterval'))
        {
            this.homey.settings.set('syncInterval', INITIAL_SYNC_INTERVAL);
        }
        try
        {
            this.interval = Number(this.homey.settings.get('syncInterval'));
            if (this.interval < MIN_SYNC_INTERVAL)
            {
                this.interval = MIN_SYNC_INTERVAL;
                this.homey.settings.set('syncInterval', this.interval);
            }
            if (this.interval > 90)
            {
                this.interval = 90;
                this.homey.settings.set('syncInterval', this.interval);
            }
        }
        catch (e)
        {
            this.interval = INITIAL_SYNC_INTERVAL;
            this.homey.settings.set('syncInterval', this.interval);
        }

        let linkUrl = this.homey.settings.get('linkurl');
        if (!linkUrl)
        {
            linkUrl = 'default';
            this.homey.settings.set('linkurl', linkUrl);
        }

        process.on('unhandledRejection', (reason, promise) =>
        {
            this.log('Unhandled Rejection at:', promise, 'reason:', reason);
            this.logInformation('Unhandled Rejection',
            {
                message: promise,
                stack: reason,
            });
        });

        this.homey.on('unload', async () =>
        {
            await this.logOut(false);
        });

        this.homey.settings.on('set', setting =>
        {
            if (setting === 'pollingEnabled')
            {
                this.pollingEnabled = this.homey.settings.get('pollingEnabled');

                this.log('Polling option changed to: ', this.pollingEnabled);

                if (this.commandsQueued === 0)
                {
                    // No commands are queued so make the changes now
                    if (this.pollingEnabled)
                    {
                        // Check if polling timer already running
                        if (this.timerId === null)
                        {
                            // It's not so start it now
                            this.startSync();
                        }
                    }
                    else
                    {
                        this.stopSync();
                    }
                }
            }
            else if (setting === 'syncInterval')
            {
                try
                {
                    this.interval = Number(this.homey.settings.get('syncInterval'));
                }
                catch (e)
                {
                    this.interval = INITIAL_SYNC_INTERVAL;
                    this.homey.settings.set('syncInterval', this.interval);
                }

                this.startSync();
            }
            else if (setting === 'infoLogEnabled')
            {
                this.infoLogEnabled = this.homey.settings.get('infoLogEnabled');
            }
            else if (setting === 'eventLogEnabled')
            {
                this.eventLogEnabled = this.homey.settings.get('eventLogEnabled');
            }
            else if (setting === 'simData')
            {
                this.syncEvents(null);
            }
        });

        this.tahoma = new Tahoma(this.homey);

        // Setup the flow listeners
        this.addScenarioActionListeners();
        this.addPollingSpeedActionListeners();
        this.addPollingActionListeners();

        /** * TEMPERATURE CONDITIONS ** */
        this._conditionTemperatureMoreThan = this.homey.flow.getConditionCard('has_temperature_more_than');
        this._conditionTemperatureMoreThan.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = device.getState().measure_temperature > args.temperature;
            return Promise.resolve(conditionMet);
        });

        this._conditionTemperatureLessThan = this.homey.flow.getConditionCard('has_temperature_less_than');
        this._conditionTemperatureLessThan.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = device.getState().measure_temperature < args.temperature;
            return Promise.resolve(conditionMet);
        });

        this._conditionTemperatureBetween = this.homey.flow.getConditionCard('has_temperature_between');
        this._conditionTemperatureBetween.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = device.getState().measure_temperature > args.temperature_from && device.getState().measure_temperature < args.temperature_to;
            return Promise.resolve(conditionMet);
        });

        /** * LUMINANCE CONDITIONS ** */
        this._conditionLuminanceMoreThan = this.homey.flow.getConditionCard('has_luminance_more_than');
        this._conditionLuminanceMoreThan.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = device.getState().measure_luminance > args.luminance;
            return Promise.resolve(conditionMet);
        });

        this._conditionLuminanceLessThan = this.homey.flow.getConditionCard('has_luminance_less_than');
        this._conditionLuminanceLessThan.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = device.getState().measure_luminance < args.luminance;
            return Promise.resolve(conditionMet);
        });

        this._conditionLuminanceBetween = this.homey.flow.getConditionCard('has_luminance_between');
        this._conditionLuminanceBetween.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = device.getState().measure_luminance > args.luminance_from && device.getState().measure_luminance < args.luminance_to;
            return Promise.resolve(conditionMet);
        });

        /** * IS MOVING CONDITION ** */
        this._conditionIsMoving = this.homey.flow.getConditionCard('is_moving');
        this._conditionIsMoving.registerRunListener(args =>
        {
            const { device } = args;
            const conditionMet = (device.executionId !== null);
            return Promise.resolve(conditionMet);
        });

        /** * COMMAND COMPLETE TRIGGER ** */
        this.commandCompleteTrigger = this.homey.flow.getTriggerCard('command_complete');
        this.commandCompleteTrigger
            .registerRunListener(async (args, state) =>
            {
                return (args.device.getAppId() === state.device.appId);
            });

        this.registerActionFlowCards();

        this.initSync();

        this.log(`${Homey.manifest.id} Initialised`);
    }

    onUninit()
    {
        // Log out but don't clear the credentials
        this.logOut( false );
    }

    registerActionFlowCards()
    {
        this.homey.flow.getActionCard('absence_heating_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('absence_heating_temperature_set');
                await args.device.onCapabilityTargetTemperatureEco(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.absence_cooling', args.target_temperature);
            });

        this.homey.flow.getActionCard('cancel_absence_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('cancel_absence_set');
                await args.device.onCapabilityBoilerMode(args.state, null);
            });

        this.homey.flow.getActionCard('set_auto_heat_cool')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_auto_heat_cool');
                await args.device.onCapabilityBoostState(args.state, null);
                return args.device.setCapabilityValue('heating_cooling_auto_switch', args.state);
            });

        this.homey.flow.getActionCard('set_pac_operating_mode')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_pac_operating_mode');
                await args.device.onCapabilityBoostState(args.state, null);
                return args.device.setCapabilityValue('pass_apc_operating_mode', args.state);
            });

        this.homey.flow.getActionCard('eco_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('eco_temperature_set');
                await args.device.onCapabilityTargetTemperatureEco(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.eco', args.target_temperature);
            });

        this.homey.flow.getActionCard('comfort_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('comfort_temperature_set');
                await args.device.onCapabilityTargetTemperatureComfort(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.comfort', args.target_temperature);
            });

        this.homey.flow.getActionCard('boiler_mode_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('boiler_mode_set');
                await args.device.onCapabilityBoilerMode(args.state, null);
                return args.device.setCapabilityValue('boiler_mode', args.state);
            });

        this.homey.flow.getActionCard('boost_on_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('boost_on_off');
                await args.device.onCapabilityBoostState(args.state, null);
                return args.device.setCapabilityValue('boost', args.state);
            });

        this.homey.flow.getActionCard('calendar_state_on')
            .registerRunListener(async (args, state) =>
            {
                this.log('calendar_state_on');
                return args.device.triggerCapabilityListener('calendar_state_on', true, null);
            });

        this.homey.flow.getActionCard('calendar_state_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('calendar_state_off');
                return args.device.triggerCapabilityListener('calendar_state_off', true, null);
            });

        this.homey.flow.getActionCard('windowcoverings_tilt')
            .registerRunListener(async (args, state) =>
            {
                this.log('windowcoverings_tilt');
                return args.device.onCapabilityWindowcoveringsTiltSet(args.windowcoverings_set, null);
            });

        this.homey.flow.getActionCard('set_quiet_mode')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_quiet_mode');
                await args.device.onCapabilityQuietMode(args.newQuietMode === 'on', null);
                return args.device.setCapabilityValue('quiet_mode', args.newQuietMode === 'on');
            });

        this.homey.flow.getActionCard('set_my_position')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_my_position');
                return args.device.onCapabilityMyPosition(true, null);
            });

        this.homey.flow.getActionCard('set_my_heat_level')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_my_heat_level');
                return args.device.triggerCapabilityListener('my_heat_level', true, null);
            });

        this.homey.flow.getActionCard('set_heat_level')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_heat_level');
                return args.device.triggerCapabilityListener('heat_level', args.heat_level, null);
            });

        this.homey.flow.getActionCard('set_on')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_on');
                return args.device.triggerCapabilityListener('on_button', true, null);
            });

        this.homey.flow.getActionCard('set_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_off');
                return args.device.triggerCapabilityListener('off_button', true, null);
            });

        this.homey.flow.getActionCard('set_open_window_activation')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_open_window_activation');
                return args.device.triggerCapabilityListener('open_window_activation', args.open_window_activation === 'on', null);
            });

        this.homey.flow.getActionCard('set_valve_auto_mode')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_valve_auto_mode');
                return args.device.triggerCapabilityListener('valve_auto_mode', args.set_valve_auto === 'on', null);
            });

        this.homey.flow.getActionCard('set_derogation_mode')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_derogation_mode');
                await args.device.setCapabilityValue('derogation_type', args.type);
                return args.device.triggerCapabilityListener('derogation_mode', args.derogation_mode, null);
            });

        this.homey.flow.getActionCard('set_open_close_stop')
            .registerRunListener(async (args, state) =>
            {
                this.log('open_close_stop');
                return args.device.sendOpenCloseStop(args.state, null);
            });

        this.homey.flow.getActionCard('start_siren')
            .registerRunListener(async (args, state) =>
            {
                this.log('start_siren');
                return args.device.triggerCapabilityListener('ring_button', null);
            });

        this.homey.flow.getActionCard('sound_alarm1')
            .registerRunListener(async (args, state) =>
            {
                this.log('sound_alarm1');
                const parameters = [args.duration * 1000, args.on_off_ratio, args.repeats - 1, args.volume];
                return args.device.triggerCapabilityListener('soundAlarm_1_button', null, parameters);
            });

        this.homey.flow.getActionCard('stop_siren')
            .registerRunListener(async (args, state) =>
            {
                this.log('stop_siren');
                return args.device.triggerCapabilityListener('stop_button', null);
            });

        this.homey.flow.getActionCard('trigger_tahoma_alarm')
            .registerRunListener(async (args, state) =>
            {
                this.log('trigger_tahoma_alarm');
                return args.device.triggerAlarmAction(args.state);
            });

        this.homey.flow.getActionCard('set_on_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_on_off');
                return args.device.sendOnOff(args.state === 'on', null);
            });

        this.homey.flow.getActionCard('set_on_with_timer')
            .registerRunListener(async (args, state) =>
            {
                this.log('set_on_with_timer');
                return args.device.sendOnWithTimer(args.onTime, null);
            });

        this.homey.flow.getActionCard('eco_cooling_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('eco_cooling_temperature_set');
                await args.device.onCapabilityTargetTemperatureEcoCooling(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.eco_cooling', args.target_temperature);
            });

        this.homey.flow.getActionCard('eco_heating_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('eco_heating_temperature_set');
                await args.device.onCapabilityTargetTemperatureEcoHeating(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.eco_heating', args.target_temperature);
            });

        this.homey.flow.getActionCard('comfort_cooling_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('comfort_cooling_temperature_set');
                await args.device.onCapabilityTargetTemperatureComfortCooling(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.comfort_cooling', args.target_temperature);
            });

        this.homey.flow.getActionCard('comfort_heating_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('comfort_heating_temperature_set');
                await args.device.onCapabilityTargetTemperatureComfortHeating(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.comfort_heating', args.target_temperature);
            });

        this.homey.flow.getActionCard('derogation_temperature_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('derogation_temperature_set');
                await args.device.onCapabilityTargetTemperatureDerogated(args.target_temperature, null);
                return args.device.setCapabilityValue('target_temperature.derogated', args.target_temperature);
            });

        this.homey.flow.getActionCard('cooling_on_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('cooling_on_off');
                await args.device.onCapabilityOnOffCooling(args.state, null);
                return args.device.setCapabilityValue('boost.cooling', args.state === 'on');
            });

        this.homey.flow.getActionCard('heating_on_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('heating_on_off');
                await args.device.onCapabilityOnOffHeating(args.state, null);
                return args.device.setCapabilityValue('boost.heating', args.state === 'on');
            });

        this.homey.flow.getActionCard('derogation_on_off')
            .registerRunListener(async (args, state) =>
            {
                this.log('derogation_on_off');
                await args.device.onCapabilityOnOffDerogated(args.state, null);
                return args.device.setCapabilityValue('boost.derogated', args.state === 'on');
            });

        this.homey.flow.getActionCard('cool_mode_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('cool_mode_set');
                await args.device.onCapabilityHeatCoolModeCool(args.state, null);
                return args.device.setCapabilityValue('heat_cool_mode.cool', args.state);
            });

        this.homey.flow.getActionCard('heat_mode_set')
            .registerRunListener(async (args, state) =>
            {
                this.log('heat_mode_set');
                await args.device.onCapabilityHeatCoolModeHeat(args.state, null);
                return args.device.setCapabilityValue('heat_cool_mode.heat', args.state);
            });
    }

    hashCode(s)
    {
        let h = 0;
        for (let i = 0; i < s.length; i++)
        {
            h = Math.imul(31, h) + s.charCodeAt(i) | 0;
        }
        return h;
    }

    // Throws an exception if the login fails
    async newLogin(args)
    {
        await this.newLogin_2(args.username, args.password, args.linkurl, false);
    }

    // Throws an exception if the login fails
    async newLogin_2(username, password, linkurl, ignoreBlock)
    {
        // Stop the timer so periodic updates don't happen while changing login
        this.loggedIn = false;
        await this.stopSync();

        // make sure we logout from old method first
        await this.tahoma.logout();

        // Allow a short delay before logging back in
        await new Promise(resolve => this.homey.setTimeout(resolve, 1000));

        // Get the last login method to use again
        // var loginMethod = this.homey.settings.get('loginMethod');

        let loginMethod = true; // Start with new method
//        let loginMethod = false; // Start with old method

        // Login with supplied credentials. An error is thrown if the login fails
        try
        {
            await this.tahoma.login(username, password, linkurl, loginMethod, ignoreBlock);
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
            await this.tahoma.login(username, password, linkurl, loginMethod, ignoreBlock);
            this.loggedIn = true;
        }

        if (this.loggedIn)
        {
            // All good so save the credentials
            this.homey.settings.set('username', username);
            this.homey.settings.set('password', password);
            this.homey.settings.set('linkurl', linkurl);
            this.homey.settings.set('loginMethod', loginMethod);

            const setupInfo = await this.tahoma.getSetupOID();
            this.somfySetupOID = setupInfo.result;

            this.startSync();
        }
        return this.loggedIn;
    }

    async logOut(ClearCredentials = true)
    {
        this.loggedIn = false;
        
        if (this.unBoostTimerID)
        {
            this.homey.clearTimeout(this.unBoostTimerID);
            this.unBoostTimerID = null;
        }
        
        let maxLoops = 50;
        while (this.unBoosting && (maxLoops-- > 0))
        {
            await this.homey.app.asyncDelay(1000);
        }

        await this.stopSync();
        await this.tahoma.logout();
        if (ClearCredentials)
        {
            this.homey.settings.unset('username');
            this.homey.settings.unset('password');
        }
        return true;
    }

    async logDevices()
    {
        if (this.infoLogEnabled)
        {
            this.logInformation('logDevices', 'Fetching devices');
        }

        const devices = await this.tahoma.getDeviceData();

        // Do a deep copy
        const logData = JSON.parse(JSON.stringify(devices));

        if (devices && this.infoLogEnabled)
        {
            this.logInformation('logDevices', `Log contains ${devices.length} devices`);
        }

        if (this.homey.settings.get('debugMode'))
        {
            if (this.infoLogEnabled)
            {
                this.logInformation('logDevices', 'Debug Mode');
            }
        }
        else
        {
            // Remove personal device information
            let i = 1;
            logData.forEach(element =>
            {
                delete element.creationTime;
                delete element.lastUpdateTime;
                delete element.shortcut;
                delete element.deviceURL;
                delete element.placeOID;
                element.oid = `temp${i++}`;
            });
        }

        this.homey.settings.set('deviceLog',
        {
            devices: logData,
        });
        this.homey.settings.unset('sendLog');
    }

    logInformation(source, error)
    {
        let data = '';
        if (error)
        {
            data = this.varToString(error);
        }

        this.error(`${source}, ${data}`);

        try
        {
            if (error)
            {
                if (error.stack)
                {
                    data = {
                        message: error.message,
                        stack: error.stack,
                    };
                }
                else if (error.message)
                {
                    data = error.message;
                }
                else
                {
                    data = error;
                }
            }

            let logData = this.homey.settings.get('infoLog');
            if (!Array.isArray(logData))
            {
                logData = [];
            }
            const nowTime = new Date(Date.now());
            logData.push(
            {
                time: nowTime.toJSON(),
                source,
                data,
            },
            );
            if (logData && logData.length > 100)
            {
                logData.splice(0, 1);
            }
            this.homey.settings.set('infoLog', logData);
        }
        catch (err)
        {
            this.log(err);
        }
    }

    logStates(txt)
    {
        if (this.homey.settings.get('stateLogEnabled'))
        {
            const log = `${this.homey.settings.get('stateLog') + txt}\n`;
            if (log && (log.length > 30000))
            {
                this.homey.settings.set('stateLogEnabled', false);
            }
            else
            {
                this.homey.settings.set('stateLog', log);
            }
        }
    }

    logEvents(txt)
    {
        const nowTime = new Date(Date.now());
        let log = this.homey.settings.get('eventLog') + nowTime.toJSON()+ "\r\n" + txt + "\r\n";
        if (log.length > 30000)
        {
            log = log.substring(log.length - 1000);
            let n = log.indexOf("\n");
            if (n >= 0)
            {
                // Remove up to and including the first \n so the log starts on a whole line
                log = log.substring(n + 1);
            }
        }
        this.homey.settings.set('eventLog', log);
    }

    async sendLog(logType)
    {
        let tries = 5;
        this.log('Send Log');
        while (tries-- > 0)
        {
            try
            {
                let subject = '';
                let text = '';
                if (logType === 'infoLog')
                {
                    subject = `Tahoma Information log`;
                    text = this.varToString(this.homey.settings.get('infoLog'));
                }
                else if (logType === 'deviceLog')
                {
                    subject = 'Tahoma device log';
                    text = this.varToString(this.homey.settings.get('deviceLog'));
                }
                else if (logType === 'eventLog')
                {
                    subject = 'Tahoma event log';
                    text = this.varToString(this.homey.settings.get('eventLog'));
                }

                subject += `(${this.homeyHash} : ${Homey.manifest.version})`;

                // create reusable transporter object using the default SMTP transport
                const transporter = nodemailer.createTransport(
                {
                    host: Homey.env.MAIL_HOST, // Homey.env.MAIL_HOST,
                    port: 465,
                    ignoreTLS: false,
                    secure: true, // true for 465, false for other ports
                    auth:
                    {
                        user: Homey.env.MAIL_USER, // generated ethereal user
                        pass: Homey.env.MAIL_SECRET, // generated ethereal password
                    },
                    tls:
                    {
                        // do not fail on invalid certs
                        rejectUnauthorized: false,
                    },
                },);

                // send mail with defined transport object
                const response = await transporter.sendMail(
                {
                    from: `"Homey User" <${Homey.env.MAIL_USER}>`, // sender address
                    to: Homey.env.MAIL_RECIPIENT, // list of receivers
                    subject, // Subject line
                    text, // plain text body
                },);

                return {
                    error: response.err,
                    message: response.err ? null : 'OK',
                };
            }
            catch (err)
            {
                this.logInformation('Send log error', err);
                return {
                    error: err,
                    message: null,
                };
            }
        }
        return {
            message: 'Failed 5 attempts',
        };
    }

    /**
     * Initializes synchronization between Homey and TaHoma
     * with the interval as defined in the settings.
     */
    async initSync()
    {
        const username = this.homey.settings.get('username');
        const password = this.homey.settings.get('password');
        const linkurl = this.homey.settings.get('linkurl');
        if (!username || !password)
        {
            return;
        }

        try
        {
            if (this.infoLogEnabled)
            {
                this.logInformation('initSync', 'Starting');
            }

            await this.newLogin_2(username, password, linkurl, false);
        }
        catch (error)
        {
            this.logInformation('initSync', 'Error');

            let timeout = 15000;
            if (error.message === 'Far Too many login attempts (blocked for 15 minutes)')
            {
                this.homey.clearTimeout(this.boostTimerId);
                this.commandsQueued = 0;
                timeout = 900000;
            }
            else if (error.message === 'Too many login attempts (blocked for 60 seconds)')
            {
                this.homey.clearTimeout(this.boostTimerId);
                this.commandsQueued = 0;
                timeout = 60000;
            }

            // Try again later
            this.timerId = this.homey.setTimeout(() => this.initSync(), timeout);
        }
    }

    // Boost the sync speed when a command is executed that has status feedback
    async boostSync()
    {
        if (this.unBoostTimerID)
        {
            this.homey.clearTimeout(this.unBoostTimerID);
            this.unBoostTimerID = null;
        }

        let maxLoops = 50;
        while (this.unBoosting && (maxLoops-- > 0))
        {
            await this.homey.app.asyncDelay(1000);
        }

        this.commandsQueued++;

        if (this.boostTimerId)
        {
            this.homey.clearTimeout(this.boostTimerId);
            this.boostTimerId = null;
        }

        // Set a time limit in case the command complete signal is missed
        this.boostTimerId = this.homey.setTimeout(() => this.unBoostSync(true), 45000);

        if (this.infoLogEnabled)
        {
            this.logInformation('Boost Sync',
            {
                message: 'Increased Polling',
                stack: { syncInterval: 3, queSize: this.commandsQueued },
            });
        }

        if (this.commandsQueued === 1)
        {
            this.nextInterval = 0;
            if (this.timerId)
            {
                this.homey.clearTimeout(this.timerId);
                this.timerId = null;
            }

            if (!this.tahoma.eventsRegistered())
            {
                // The events are not currently registered so do that now
                try
                {
                    await this.tahoma.getEvents();
                }
                catch (error)
                {
                    this.logInformation('Boost Sync register events: ', error.message);
                    this.commandsQueued = 0;
                    return false;
                }
            }

            this.nextInterval = 3000;
            if (!this.syncing)
            {
                // We can't run the sync loop from here so fire it from a timer
                this.timerId = this.homey.setTimeout(() => this.syncLoop(3000), 1000);
            }
        }
        else
        {
            let maxDelay = 6;
            while ((maxDelay > 0) && (this.commandsQueued > 0) && (!this.tahoma.eventsRegistered()))
            {
                await this.asyncDelay(500);
                maxDelay--;
            }

            if ((!this.tahoma.eventsRegistered()))
            {
                return false;
            }
        }

        return true;
    }

    async unBoostSync(immediate = false)
    {
        this.unBoosting = true;
        this.pollingEnabled = this.homey.settings.get('pollingEnabled');

        if (immediate)
        {
            if (this.unBoostTimerID)
            {
                this.homey.clearTimeout(this.unBoostTimerID);
                this.unBoostTimerID = null;
            }
            this.commandsQueued = 0;
        }
        else
        {
            if (!this.pollingEnabled)
            {
                // Polling is not enabled so delay by 10 seconds to ensure all the new states a=have come through
                if (this.infoLogEnabled)
                {
                    this.logInformation('UnBoost delayed by 16 seconds');
                }
                
                this.unBoostTimerID = this.homey.setTimeout(() => this.unBoostSync(true), 16000);
                this.unBoosting = false;
                return;
            }
        }

        if (this.infoLogEnabled)
        {
            this.logInformation('UnBoost Sync',
            {
                message: 'Reverting to previous Polling',
                stack:
                {
                    timeOut: immediate,
                    pollingMode: this.pollingEnabled,
                    syncInterval: this.interval,
                    queSize: this.commandsQueued,
                },
            });
        }

        if (this.commandsQueued > 0)
        {
            this.commandsQueued--;
        }

        if (this.commandsQueued === 0)
        {
            this.homey.clearTimeout(this.boostTimerId);
            this.boostTimerId = null;
            if (this.pollingEnabled)
            {
                this.startSync();
            }
            else
            {
                await this.stopSync();  
            }
        }
        this.unBoosting = false;
    }

    async stopSync()
    {
        if (this.infoLogEnabled)
        {
            this.logInformation('Stop sync requested');
        }

        this.pollingEnabled = false;

        if (this.commandsQueued > 0)
        {
            this.commandsQueued = 0;
            this.homey.clearTimeout(this.boostTimerId);
            this.boostTimerId = null;
        }

        this.nextInterval = 0;

        if (this.timerId)
        {
            this.homey.clearTimeout(this.timerId);
            this.timerId = null;
        }

        if (this.infoLogEnabled)
        {
            this.logInformation('stopSync', 'Stopping Event Polling');
        }
        await this.tahoma.eventsClearRegistered();
    }

    async startSync()
    {
        if (this.commandsQueued > 0)
        {
            // Boost already running
            return;
        }

        this.nextInterval = 0;

        if (this.timerId)
        {
            this.homey.clearTimeout(this.timerId);
            this.timerId = null;
        }

        this.pollingEnabled = this.homey.settings.get('pollingEnabled');
        if (this.pollingEnabled)
        {
            if (this.infoLogEnabled)
            {
                this.logInformation('Start sync requested');
            }

            let interval = 0.1;

            // make sure the new sync is at least 30 second after the last one
            let minSeconds = (30000 - (Date.now() - this.lastSync)) / 1000;
            if (minSeconds > 0)
            {
                if (minSeconds > 30)
                {
                    minSeconds = 30;
                }
                interval = minSeconds;
            }

            if (this.infoLogEnabled)
            {
                this.logInformation('Restart sync in: ', interval);
            }

            this.nextInterval = this.interval * 1000;
            if (!this.syncing)
            {
                this.timerId = this.homey.setTimeout(() => this.syncLoop(), interval * 1000);
            }
        }
    }

    // The main polling loop that fetches events and sends them to the devices
    async syncLoop()
    {
        if (this.infoLogEnabled)
        {
            this.logInformation('syncLoop', `Logged in = ${this.loggedIn}, Old Sync State = ${this.syncing}, Next Interval = ${this.nextInterval}`);
        }

        if (this.loggedIn && !this.syncing)
        {
            this.syncing = true;

            if (this.timerId)
            {
                // make sure any existing timer is canceled
                this.homey.clearTimeout(this.timerId);
                this.timerId = null;
            }

            let nextInterval = this.nextInterval;

            // Make sure it has been about 30 seconds since last sync unless boost is on
            if (this.boostTimerId || (Date.now() - this.lastSync) > 28000)
            {
                this.lastSync = Date.now();

                try
                {
                    const events = await this.tahoma.getEvents();
                    if ((events === null && this.boostTimerId === null) || (events && events.length > 0))
                    {
                        // If events === null and boostTimer === null then refresh all the devices, but don't do that if the boost is on
                        if (events !== null && this.eventLogEnabled)
                        {
                            this.logEvents(this.varToString(events));
                        }
                        await this.syncEvents(events);
                    }
                }
                catch (error)
                {
                    this.logInformation('syncLoop', error.message);
                    if (error.message === 'Far Too many login attempts (blocked for 15 minutes)')
                    {
                        this.homey.clearTimeout(this.boostTimerId);
                        this.commandsQueued = 0;
                        nextInterval = 900000;
                    }
                    else if (error.message === 'Too many login attempts (blocked for 60 seconds)')
                    {
                        this.homey.clearTimeout(this.boostTimerId);
                        this.commandsQueued = 0;
                        nextInterval = 60000;
                    }
                }
            }
            else
            {
                if (this.infoLogEnabled)
                {
                    this.logInformation('Skipping sync: too soon');
                }
            }

            if (this.nextInterval > 0)
            {
                // Setup timer for next sync
                this.timerId = this.homey.setTimeout(() => this.syncLoop(), nextInterval);
            }
            else
            {
                if (this.infoLogEnabled)
                {
                    this.logInformation('Not renewing sync');
                }
            }

            // Signal that the sync has completed
            this.syncing = false;
        }
        else if (!this.loggedIn)
        {
            if (this.infoLogEnabled)
            {
                this.logInformation('Skipping sync: Not logged in');
            }   
        }
        else
        {
            if (this.infoLogEnabled)
            {
                this.logInformation('Skipping sync: Previous sync active');
            }
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
                    this.logInformation('Device status update', 'Refreshing');
                }
            }
            else if (this.infoLogEnabled)
            {
                this.logInformation('Device status update', 'Renewing');
            }

            const promises = [];

            const drivers = this.homey.drivers.getDrivers();
            // eslint-disable-next-line no-restricted-syntax
            for (const driver in drivers)
            {
                if (Object.prototype.hasOwnProperty.call(drivers, driver))
                {
                    const devices = this.homey.drivers.getDriver(driver).getDevices();
                    const numDevices = devices ? devices.length : 0;
                    for (let i = 0; i < numDevices; i++)
                    {
                        const device = devices[i];
                        try
                        {
                            promises.push(device.syncEvents(events));
                        }
                        catch (error)
                        {
                            this.logInformation('Sync Devices', error.message);
                        }
                    }
                }
            }

            // Wait for all the checks to complete
            await Promise.allSettled(promises);

            if (this.infoLogEnabled)
            {
                this.logInformation('Device status update', 'Complete');
            }
        }
        catch (error)
        {
            this.logInformation(error.message, error.stack);
        }
    }

    // Trigger command complete
    triggerCommandComplete(device, commandName, success)
    {
        // trigger the card
        const tokens = { state: success, name: commandName };
        const state = { device };

        this.commandCompleteTrigger.trigger(tokens, state)
            .then(this.log)
            .catch(this.error);
    }

    /**
     * Adds a listener for flowcard scenario actions
     */
    addScenarioActionListeners()
    {
        /** * ADD FLOW ACTION LISTENERS ** */
        this.homey.flow.getActionCard('activate_scenario')
            .registerRunListener(async (args, state) =>
            {
                return this.tahoma.executeScenario(args.scenario.oid);
            })
            .getArgument('scenario').registerAutocompleteListener(query =>
            {
                return this.tahoma.getActionGroups().then(data => data.map(({ oid, label }) => (
                {
                    oid,
                    name: label,
                })).filter(({ name }) => name.toLowerCase().indexOf(query.toLowerCase()) > -1)).catch(error =>
                {
                    this.logInformation('addScenarioActionListeners', error.message);
                });
            });
    }

    /**
     * Adds a listener for polling speed flowcard actions
     */
    addPollingSpeedActionListeners()
    {
        this.homey.flow.getActionCard('set_polling_speed')
            .registerRunListener(async (args, state) =>
            {
                this.interval = Math.max(args.syncSpeed, 30);
                this.homey.settings.set('syncInterval', this.interval.toString());
                this.homey.settings.set('pollingEnabled', true);

                if (this.commandsQueued > 0)
                {
                    // Sync is currently boosted so don't make any changes now
                    return;
                }

                this.startSync();
            });
    }

    /**
     * Adds a listener for polling mode flowcard actions
     */
    addPollingActionListeners()
    {
        this.homey.flow.getActionCard('set_polling_mode')
            .registerRunListener(async (args, state) =>
            {
                this.pollingEnabled = args.newPollingMode === 'on';
                this.homey.settings.set('pollingEnabled', this.pollingEnabled);

                if (this.commandsQueued > 0)
                {
                    // Sync is currently boosted so don't make any changes now
                    return true;
                }

                if (args.newPollingMode === 'once')
                {
                    if (this.timerId)
                    {
                        // Already polling
                        return true;
                    }

                    if (!this.syncing)
                    {
                        this.nextInterval = 0;

                        // Not currently in the sync routine so start a sync in 3 seconds
                        this.timerId = this.homey.setTimeout(() => this.syncLoop(), 3000);
                    }
                }
                return true;
            });
    }

    async asyncDelay(period)
    {
        await new Promise(resolve => this.homey.setTimeout(resolve, period));
    }

    varToString(source)
    {
        try
        {
            if (source === null)
            {
                return 'null';
            }
            if (source === undefined)
            {
                return 'undefined';
            }
            if (source instanceof Error)
            {
                const stack = source.stack.replace('/\\n/g', '\n');
                return `${source.message}\n${stack}`;
            }
            if (typeof (source) === 'object')
            {
                const getCircularReplacer = () =>
                {
                    const seen = new WeakSet();
                    return (key, value) =>
                    {
                        if (typeof value === 'object' && value !== null)
                        {
                            if (seen.has(value))
                            {
                                return '';
                            }
                            seen.add(value);
                        }
                        return value;
                    };
                };

                return JSON.stringify(source, getCircularReplacer(), 2);
            }
            if (typeof (source) === 'string')
            {
                return source;
            }
        }
        catch (err)
        {
            this.homey.app.updateLog(`VarToString Error: ${err}`, 0);
        }

        return source.toString();
    }

}
module.exports = myApp;
