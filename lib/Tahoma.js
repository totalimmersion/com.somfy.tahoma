/* jslint node: true */

'use strict';

/* eslint-disable no-use-before-define */
const Homey = require('homey');
const FormData = require('form-data');
const HttpHelper = require('./HttpHelper');

/* OAuth login information from https://github.com/yenoiwesa/homebridge-connexoon */

module.exports = class Tahoma extends Homey.SimpleClass
{

    constructor(Homey)
    {
        super();

        this.loginAttempts60s = 0;
        this.loginAttempts15m = 0;
        this.loginTimer60sID = null;
        this.loginTimer15mID = null;
        this.registerResponse = null;

        this.homey = Homey;
        this.httpHelper = new HttpHelper(Homey);

        return this;
    }

    // Throws an error if the login fails
    async login(username, password, linkurl, oauthLogin, ignoreBlock = false)
    {
        if (await this.httpHelper.checkAuthentication(false))
        {
            // Already authenticated. Logout first to do a new login
            return;
        }

        // IgnoreBlock should only be set for a GUI login
        if (!ignoreBlock)
        {
            // Keep track of the number of login attempts
            this.loginAttempts60s++;
            this.loginAttempts15m++;

            // Check if the timer is running
            if (this.loginTimer60sID === null)
            {
                // Start the timer
                this.loginTimer60sID = this.homey.setTimeout(() =>
                {
                    // Reset the login attempts to allow 2 more in the next time period
                    this.loginAttempts60s = 0;

                    this.loginTimer60sID = null;
                }, 60000);
            }

            if (this.loginTimer15mID === null)
            {
                // Start the timer
                this.loginTimer15mID = this.homey.setTimeout(() =>
                {
                    // Reset the login attempts to allow 2 more in the next time period
                    this.loginAttempts15m = 0;

                    this.loginTimer15mID = null;
                }, 900000);
            }

            // Allow up to 2 login attempts in 20 seconds or 6 in 5 minutes
            if ((this.loginAttempts60s > 2) || (this.loginAttempts15m > 6))
            {
                throw (this.loginAttempts15m > 6 ? new Error('Far Too many login attempts (blocked for 15 minutes)') : new Error('Too many login attempts (blocked for 60 seconds)'));
            }
        }

        try
        {
            this.httpHelper.setAuthenticating(true);
            this.httpHelper.setBaseURL(linkurl);
            this.registerResponse = null;
            this.registeringEvents = false;

            // Check the type of login required
            if (!oauthLogin)
            {
                if (this.homey.app.infoLogEnabled)
                {
                    // Use simple login
                    this.homey.app.logInformation('Tahoma Login',
                    {
                        message: 'Start Simple Login',
                        stack: { attempts: this.loginAttempts60s, linkURL: linkurl },
                    });
                }

                // Clear the headers and use token cookie
                this.httpHelper.setDefaultHeaders({}, true);

                const form = new FormData();
                form.append('userId', username);
                form.append('userPassword', password);

                const headers = form.getHeaders();

                const result = await this.httpHelper.postLogin('/login', { headers }, form);

                if (this.homey.app.infoLogEnabled)
                {
                    this.homey.app.logInformation('Tahoma Simple Login',
                    {
                        message: 'Successful',
                        stack: result,
                    });
                }
            }
            else
            {
                // Use OAuth login
                if (this.homey.app.infoLogEnabled)
                {
                    this.homey.app.logInformation('Tahoma Login',
                    {
                        message: 'Start OAuth Login',
                        stack: { attempts: this.loginAttempts, blocked: this.loginsBlocked, linkURL: linkurl },
                    });
                }

                // Clear the headers and use credentials
                this.httpHelper.setDefaultHeaders({}, true);

                const data = {
                    grant_type: 'password',
                    username,
                    password,
                    client_id: Homey.env.SOMFY_OAUTH_CLIENT_ID,
                    client_secret: Homey.env.SOMFY_OAUTH_CLIENT_SECRET,
                };

                const config = {
                    headers:
                    {
                        'content-type': 'application/json',
                        host: 'accounts.somfy.com',
                        'User-Agent': 'homey',
                    },
                };

                // Throws an exception if login fails
                const result = await this.httpHelper.postLogin(Homey.env.SOMFY_OAUTH_URL, config, data);

                // Setup the token header and stop using token cookie
                const headers = {
                    Authorization: `Bearer ${result.access_token}`,
                };

                this.httpHelper.setDefaultHeaders(headers, false);

                // get the User ID as it is quick and will test if the OAuth login allows us to use the API
                const userId = await this.getUserId();
                this.log('User Id = ', userId);

                if (this.homey.app.infoLogEnabled)
                {
                    this.homey.app.logInformation('Tahoma OAuth Login',
                    {
                        message: `Successful as ${userId}`,
                        stack: result,
                    });
                }
            }
        }
        catch (error)
        {
            this.httpHelper.setAuthenticating(false);
            throw (error);
        }
    }

    async logout()
    {
        try
        {
            if (await this.httpHelper.checkAuthentication(false))
            {
                await this.httpHelper.post('/logout');
            }
        }
        catch (error)
        {
            this.log('Logout: ', error);
        }

        // Clear the headers and don't use credentials
        this.httpHelper.setDefaultHeaders({}, false);
        this.httpHelper.clearAuthenticated();
    }

    async getSetupOID()
    {
        if (this.homey.app.loggedIn)
        {
            return this.httpHelper.get('/enduser/defaultSetupOID');
        }
        throw (new Error('Not Logged in'));
    }

    async getDeviceData()
    {
        if (this.homey.app.loggedIn)
        {
            if (this.homey.settings.get('debugMode'))
            {
                const simData = this.homey.settings.get('simData');
                if (simData)
                {
                    return simData;
                }
            }
            return this.httpHelper.get('/setup/devices');
        }
        throw (new Error('Not Logged in'));
    }

    async getDeviceStates(deviceUrl)
    {
        if (this.homey.app.loggedIn)
        {
            const states = await this.httpHelper.get(`/setup/devices/${encodeURIComponent(deviceUrl)}/states`);
            if (this.isEmpty(states))
            {
                return null;
            }
            return states;
        }
        throw (new Error('Not Logged in'));
    }

    async getDeviceSingleState(deviceUrl, state)
    {
        if (this.homey.app.loggedIn)
        {
            return this.httpHelper.get(`/setup/devices/${encodeURIComponent(deviceUrl)}/states/${encodeURIComponent(state)}`);
        }
        throw (new Error('Not Logged in'));
    }

    async getActionGroups()
    {
        if (this.homey.app.loggedIn)
        {
            return this.httpHelper.get('/actionGroups');
        }
        throw (new Error('Not Logged in'));
    }

    /**
     * Gets the device state history from TaHoma
     * @param {string} deviceUrl - The device url for the device as defined in TaHoma
     * @param {string} state - The device state for which to retrieve the hisory
     * @param {timestamp} from - The timestamp from which to retrieve the history
     * @param {timestamp} to - The timestamp until to retrieve the history
     * @async
     */
    async getDeviceStateHistory(deviceUrl, state, from, to)
    {
        if (this.homey.app.loggedIn)
        {
            return this.httpHelper.get(`/setup/devices/${encodeURIComponent(deviceUrl)}/states/${encodeURIComponent(state)}/history/${from}/${to}`);
        }
        throw (new Error('Not Logged in'));
    }

    /**
     * Executes an action on a give device in TaHoma
     * @param {string} name - Name of the device
     * @param {string} deviceUrl - Url of the device
     * @param {Object} action - An object defining the action to be executed in TaHoma
     * @example
     * const action = {
     *    name: 'open',
     *    parameters: []
     * };
     *
     */
    async executeDeviceAction(name, deviceUrl, action, action2)
    {
        if (this.homey.app.loggedIn)
        {
            if (deviceUrl)
            {
                const data = {
                    label: `${name} - ${action.name}  - Homey`,
                    actions: [
                    {
                        deviceURL: deviceUrl,
                        commands: [
                            action,
                        ],
                    }],
                };

                if (action2)
                {
                    data.actions[0].commands.push(action2);
                }

                const options = {
                    json: true,
                };
                return this.httpHelper.post('/exec/apply', options, data);
            }
            this.homey.app.logInformation(name,
            {
                message: deviceUrl,
                stack: action,
            });

            throw (new Error('No device URL'));
        }
        throw (new Error('Not Logged in'));
    }

    /**
     * Executes a TaHoma scenario
     * @param {string} scenarioId - The id of the scenario (oid in TaHoma)
     * @returns {Promise<Object>}
     * @async
     */
    async executeScenario(scenarioId)
    {
        if (this.homey.app.loggedIn)
        {
            return this.httpHelper.post(`/exec/${scenarioId}`);
        }
        throw (new Error('Not Logged in'));
    }

    /**
     * Cancels the execution of a previously defined action
     * @param {string} executionId - The execution id of the action
     * @returns {Promise<Object>}
     * @async
     */
    async cancelExecution(executionId)
    {
        if (executionId && this.homey.app.loggedIn)
        {
            return this.httpHelper.delete(`/exec/current/setup/${executionId}`);
        }
        throw (new Error('Not Logged in'));
    }

    // Returns true if the events are registered or are being registered
    eventsRegistered()
    {
        return ((this.registerResponse && this.registerResponse.id) || this.registeringEvents);
    }

    async eventsClearRegistered()
    {
        let maxLoops = 60;
        while (this.registeringEvents && (maxLoops-- > 0))
        {
            await this.homey.app.asyncDelay(500);
        }
        this.registerResponse = null;
        this.registeringEvents = false;
    }

    // Returns true if the events are already registered
    // Throws an error if the registration fails
    async registerEvents()
    {
        // Check to see if the events are already being registered by another 'task'
        if (this.registeringEvents)
        {
            if (this.homey.app.infoLogEnabled)
            {
                this.homey.app.logInformation('Register Events', 'Waiting..');
            }

            let maxLoops = 60;
            while (this.registeringEvents && (maxLoops-- > 0))
            {
                await this.homey.app.asyncDelay(500);
            }

            if (this.registeringEvents)
            {
                this.registeringEvents = false;
                this.homey.app.logInformation('Timeout while registering events', 'Aborting');
            }

            if (!this.registerResponse || !this.registerResponse.id)
            {
                throw (new Error('Register events failed'));
            }

            // return false so the devices fetch the status data
            return false;
        }
        if (!this.registerResponse || !this.registerResponse.id)
        {
            // Events are not registered yet
            this.registeringEvents = true;
            if (this.homey.app.infoLogEnabled)
            {
                this.homey.app.logInformation('Register Events', 'Starting');
            }

            try
            {
                this.registerResponse = await this.httpHelper.post('/events/register');
                if (this.homey.app.infoLogEnabled)
                {
                    this.homey.app.logInformation('Register Events',
                    {
                        message: 'Success',
                        stack: this.registerResponse,
                    });
                }

                this.registeringEvents = false;

                // return false so the devices fetch the status data
                return false;
            }
            catch (error)
            {
                this.registerResponse = null;
                this.homey.app.logInformation('Register Events', error.message);
                this.registeringEvents = false;
                throw (error);
            }
        }

        return true;
    }

    // Returns null if it fails or a it's new registration so the devices need to fetch their data,
    // or returns an array of status changes since the las call, which maybe an empty array if nothing has changed
    async getEvents()
    {
        if (this.homey.app.loggedIn)
        {
            // Throws an error if registration fails. Returns true if already registered
            if (await this.registerEvents())
            {
                // Get new events
                try
                {
                    const events = await this.httpHelper.post(`/events/${this.registerResponse.id}/fetch`);
                    if (events === undefined)
                    {
                        const message = this.registerRespons ? this.registerResponse.id : '';
                        throw (new Error(`Undefined response for /events/${message}/fetch`));
                    }

                    if (this.homey.app.infoLogEnabled)
                    {
                        if (events && (events.length > 0))
                        {
                            this.homey.app.logInformation('Fetching Events',
                            {
                                message: 'Complete',
                                stack: events,
                            });
                        }
                        else
                        {
                            this.homey.app.logInformation('Fetching Events', 'Complete');
                        }
                    }

                    return events;
                }
                catch (error)
                {
                    this.registerResponse = null;
                    this.homey.app.logInformation('Fetching Events Error',
                    {
                        message: (typeof (error) === 'string') ? error : error.message,
                    });
                    throw (error);
                }
            }

            return null;
        }
        throw (new Error('Not Logged in'));
    }

    async refreshStates()
    {
        await this.httpHelper.post('/setup/devices/states/refresh');
    }

    async getUserId()
    {
        return this.httpHelper.get('/currentUserId');
    }

    updateBaseURL(linkurl)
    {
        this.httpHelper.setBaseURL(linkurl);
    }

    isEmpty(obj)
    {
        // eslint-disable-next-line no-restricted-syntax
        for (const key in obj)
        {
            if (Object.prototype.hasOwnProperty.call(obj, key))
            {
                return false;
            }
        }
        return true;
    }

};
