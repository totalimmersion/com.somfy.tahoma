/*jslint node: true */
'use strict';
/* eslint-disable no-use-before-define */
const Homey = require('homey');
const FormData = require('form-data');

/* OAuth login information from https://github.com/yenoiwesa/homebridge-connexoon */

/**
 * Class for communicating with the TaHoma cloud service
 * @hideconstructor
 */
class Tahoma extends Homey.SimpleClass
{
    // Throws an error if the login fails
    static async login(username, password, linkurl, oauthLogin, ignoreBlock = false)
    {
        if (await HttpHelper.checkAuthentication(false))
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
                this.loginTimer60sID = setTimeout(() =>
                {
                    // Reset the login attempts to allow 2 more in the next time period
                    this.loginAttempts60s = 0;

                    this.loginTimer60sID = null;
                }, 60000);
            }

            if (this.loginTimer15mID === null)
            {
                // Start the timer
                this.loginTimer15mID = setTimeout(() =>
                {
                    // Reset the login attempts to allow 2 more in the next time period
                    this.loginAttempts15m = 0;

                    this.loginTimer15mID = null;
                }, 900000);
            }

            // Allow up to 2 login attempts in 20 seconds or 6 in 5 minutes
            if ((this.loginAttempts60s > 2) || (this.loginAttempts15m > 6))
            {
                throw (this.loginAttempts15m > 6 ? "Far Too many login attempts (blocked for 15 minutes)" : "Too many login attempts (blocked for 60 seconds)");
            }
        }

        try
        {
            HttpHelper.setAuthenticating(true);
            HttpHelper.setBaseURL(linkurl);
            this.registerResponse = null;
            this.registeringEvents = false;

            // Check the type of login required
            if (!oauthLogin)
            {
                if (Homey.app.infoLogEnabled)
                {
                    // Use simple login
                    Homey.app.logInformation("Tahoma Login",
                    {
                        message: "Start Simple Login",
                        stack: { attempts: this.loginAttempts, blocked: this.loginsBlocked, linkURL: linkurl }
                    });
                }

                //Clear the headers and use token cookie
                HttpHelper.setDefaultHeaders({}, true);

                const form = new FormData();
                form.append('userId', username);
                form.append('userPassword', password);

                let headers = form.getHeaders();

                const result = await HttpHelper.postLogin('/login', { headers: headers }, form);

                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("Tahoma Simple Login",
                    {
                        message: "Successful",
                        stack: result
                    });
                }
            }
            else
            {
                //Use OAuth login
                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("Tahoma Login",
                    {
                        message: "Start OAuth Login",
                        stack: { attempts: this.loginAttempts, blocked: this.loginsBlocked, linkURL: linkurl }
                    });
                }

                //Clear the headers and use credentials
                HttpHelper.setDefaultHeaders({}, true);

                let formData = {
                    grant_type: 'password',
                    username: username,
                    password: password,
                    client_id: Homey.env.SOMFY_OAUTH_CLIENT_ID,
                    client_secret: Homey.env.SOMFY_OAUTH_CLIENT_SECRET,
                };

                // const data = encodeForm((formData));
                const data = formData;

                const config = {
                    headers:
                    {
                        'content-type': 'application/json',
                        'host': 'accounts.somfy.com',
                        'User-Agent': 'homey'
                    }
                };

                // Throws an exception if login fails
                const result = await HttpHelper.postLogin(Homey.env.SOMFY_OAUTH_URL, config, data);

                // Setup the token header and stop using token cookie
                const headers = {
                    Authorization: "Bearer " + result.access_token
                };

                HttpHelper.setDefaultHeaders(headers, false);
                
                // get the User ID as it is quick and will test if the OAuth login allows us to use the API
                const userId = await this.getUserId();
                console.log("User Id = ", userId);

                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("Tahoma OAuth Login",
                    {
                        message: "Successful as " + userId,
                        stack: result
                    });
                }
            }
        }
        catch (error)
        {
            HttpHelper.setAuthenticating(false);
            throw (error);
        }
    }

    static async logout()
    {
        try
        {
            if (await HttpHelper.checkAuthentication(false))
            {
                await HttpHelper.post('/logout');
            }
        }
        catch (error)
        {
            console.log("Logout: ", error);
        }

        //Clear the headers and don't use credentials
        HttpHelper.setDefaultHeaders({}, false);
        HttpHelper.clearAuthenticated();
    }

    static async getDeviceData()
    {
        if (Homey.app.loggedIn)
        {
            if (Homey.ManagerSettings.get('debugMode'))
            {
                const simData = Homey.ManagerSettings.get('simData');
                if (simData)
                {
                    return simData;
                }
            }
            return await HttpHelper.get('/setup/devices');
        }
        throw (new Error("Not Logged in"));
    }

    static async getDeviceStates(deviceUrl)
    {
        if (Homey.app.loggedIn)
        {
            const states = await HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states');
            if (this.isEmpty(states))
            {
                return null;
            }
            return states;
        }
        throw (new Error("Not Logged in"));
    }

    static async getDeviceSingleState(deviceUrl, state)
    {
        if (Homey.app.loggedIn)
        {
            return await HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state));
        }
        throw (new Error("Not Logged in"));
    }

    static async getActionGroups()
    {
        if (Homey.app.loggedIn)
        {
            return await HttpHelper.get('/actionGroups');
        }
        throw (new Error("Not Logged in"));
    }

    /**
     * Gets the device state history from TaHoma
     * @param {string} deviceUrl - The device url for the device as defined in TaHoma
     * @param {string} state - The device state for which to retrieve the hisory
     * @param {timestamp} from - The timestamp from which to retrieve the history
     * @param {timestamp} to - The timestamp until to retrieve the history
     * @async
     */
    static async getDeviceStateHistory(deviceUrl, state, from, to)
    {
        if (Homey.app.loggedIn)
        {
            return await HttpHelper.get('/setup/devices/' + encodeURIComponent(deviceUrl) + '/states/' + encodeURIComponent(state) + '/history/' + from + '/' + to);
        }
        throw (new Error("Not Logged in"));
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
    static async executeDeviceAction(name, deviceUrl, action)
    {
        if (Homey.app.loggedIn)
        {
            const data = {
                label: name + ' - ' + action.name + '  - Homey',
                actions: [
                {
                    deviceURL: deviceUrl,
                    commands: [
                        action
                    ]
                }]
            };
            const options = {
                json: true,
            };
            return await HttpHelper.post('/exec/apply', options, data);
        }
        throw (new Error("Not Logged in"));
    }

    /**
     * Executes a TaHoma scenario
     * @param {string} scenarioId - The id of the scenario (oid in TaHoma)
     * @returns {Promise<Object>}
     * @async
     */
    static async executeScenario(scenarioId)
    {
        if (Homey.app.loggedIn)
        {
            return await HttpHelper.post('/exec/' + scenarioId);
        }
        throw (new Error("Not Logged in"));
    }

    /**
     * Cancels the execution of a previously defined action
     * @param {string} executionId - The execution id of the action
     * @returns {Promise<Object>}
     * @async
     */
    static async cancelExecution(executionId)
    {
        if (Homey.app.loggedIn)
        {
            return await HttpHelper.delete('/exec/current/setup/' + executionId);
        }
        throw (new Error("Not Logged in"));
    }

    // Returns true if the events are registered or are being registered
    static eventsRegistered()
    {
        return ((this.registerResponse && this.registerResponse.id) || this.registeringEvents);
    }

    static async eventsClearRegistered()
    {
        let maxLoops = 60;
        while (this.registeringEvents && (maxLoops-- > 0))
        {
            await Homey.app.asyncDelay(500);
        }
        this.registerResponse = null;
        this.registeringEvents = false;
    }

    // Returns true if the events are already registered
    // Throws an error if the registration fails
    static async registerEvents()
    {
        // Check to see if the events are already being registered by another 'task'
        if (this.registeringEvents)
        {
            if (Homey.app.infoLogEnabled)
            {
                Homey.app.logInformation("Register Events", "Waiting..");
            }

            let maxLoops = 60;
            while (this.registeringEvents && (maxLoops-- > 0))
            {
                await Homey.app.asyncDelay(500);
            }

            if (this.registeringEvents)
            {
                this.registeringEvents = false;
                Homey.app.logInformation("Timeout while registering events", "Aborting");
            }

            if (!this.registerResponse || !this.registerResponse.id)
            {
                throw ("Register events failed");
            }

            // return false so the devices fetch the status data
            return false;
        }
        else if (!this.registerResponse || !this.registerResponse.id)
        {
            // Events are not registered yet
            this.registeringEvents = true;
            if (Homey.app.infoLogEnabled)
            {
                Homey.app.logInformation("Register Events", "Starting");
            }

            try
            {
                this.registerResponse = await HttpHelper.post('/events/register');
                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("Register Events",
                    {
                        message: "Success",
                        stack: this.registerResponse
                    });
                }

                this.registeringEvents = false;

                // return false so the devices fetch the status data
                return false;
            }
            catch (error)
            {
                this.registerResponse = null;
                Homey.app.logInformation("Register Events", error.message);
                this.registeringEvents = false;
                throw (error);
            }
        }

        return true;
    }

    // Returns null if it fails or a it's new registration so the devices need to fetch their data,
    // or returns an array of status changes since the las call, which maybe an empty array if nothing has changed
    static async getEvents()
    {
        if (Homey.app.loggedIn)
        {
            // Throws an error if registration fails. Returns true if already registered
            if (await this.registerEvents())
            {
                // Get new events
                try
                {
                    if (Homey.app.infoLogEnabled)
                    {
                        Homey.app.logInformation("Fetch Events", "Starting");
                    }

                    const events = await HttpHelper.post('/events/' + this.registerResponse.id + '/fetch');
                    if (events === undefined)
                    {
                        throw ("Undefined response for /fetch");
                    }

                    if (Homey.app.infoLogEnabled)
                    {
                        Homey.app.logInformation("Fetch Events",
                        {
                            message: "Complete",
                            stack: events
                        });
                    }

                    return events;
                }
                catch (error)
                {
                    this.registerResponse = null;
                    Homey.app.logInformation("Fetch Events",
                    {
                        message: error.message
                    });
                    throw (error);
                }
            }

            return null;
        }
        throw ("Not Logged in");
    }

    static async refreshStates()
    {
        await HttpHelper.post('/setup/devices/states/refresh');
    }

    static async getUserId()
    {
        return await HttpHelper.get('/currentUserId');
    }

    static updateBaseURL(linkurl)
    {
        HttpHelper.setBaseURL(linkurl);
    }

    static isEmpty(obj)
    {
        for (var key in obj)
        {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }
}
Tahoma.loginAttempts60s = 0;
Tahoma.loginAttempts15m = 0;
Tahoma.loginTimer60sID = null;
Tahoma.loginTimer15mID = null;
Tahoma.registerResponse = null;

module.exports = Tahoma;
const HttpHelper = require('./HttpHelper');