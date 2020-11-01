'use strict';
/* eslint-disable no-use-before-define */
const Homey = require('homey');

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
            return oauthLogin;
        }

        if (!ignoreBlock)
        {
            // Keep track of the number of login attempts
            this.loginAttempts++;

            if (this.loginTimerID === null)
            {
                // Only allow 4 logins with 20s. If there are 3 * 20s timeouts the block for 5 minutes
                this.loginTimerID = setTimeout(() =>
                {
                    if (this.loginAttempts > 4)
                    {
                        // Keep track of how many consecutive login blocks there have been
                        this.loginsBlocked++;
                    }
                    else
                    {
                        this.loginsBlocked = 0;
                    }
                    this.loginAttempts = 0;
                    this.loginTimerID = null;
                }, this.loginsBlocked > 3 ? 300000 : 20000); // If the login has been blocked too many times then set a 5 minute timeout else set a 20 second timeout
            }

            if (this.loginAttempts === 3)
            {
                oauthLogin = !oauthLogin;
            }

            // Allow up to 5 login attempts in 10 seconds
            if ((this.loginAttempts > 4) || (this.loginsBlocked > 3))
            {
                throw (new Error(this.loginsBlocked > 3 ? "Far Too many login attempts (blocked for 5 minutes)" : "Too many login attempts (blocked for 20 seconds)"));
            }
        }

        try
        {
            HttpHelper.setAuthenticating(true);
            HttpHelper.setBaseURL(linkurl);
            this.registerResponse = null;
            this.registeringEvents = false;

            // Helper function to encode the form data so it can be transmitted
            const encodeForm = (data) =>
            {
                return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
            }

            // Check the type of login required
            if (!oauthLogin)
            {
                // Use simple login
                Homey.app.logInformation("Tahoma Login",
                {
                    message: "Start Simple Login",
                    stack: {attempts: this.loginAttempts, blocked: this.loginsBlocked, linkURL: linkurl}
                });
    
                //Clear the headers and use token cookie
                HttpHelper.setDefaultHeaders({}, true);

                let formData = {
                    userId: username,
                    userPassword: password
                };

                const data = encodeForm((formData));

                const config = {
                    headers:
                    {
                        'content-type': 'application/x-www-form-urlencoded',
                        'content-length': data.length,
                        'host': HttpHelper.getHostName(linkurl),
                        'User-Agent': 'homey'
                    }
                };

                const result = await HttpHelper.postLogin('/login', config, data);

                Homey.app.logInformation("Tahoma Simple Login",
                {
                    message: "Successful",
                    stack: result
                });
            }
            else
            {
                //Use OAuth login
                Homey.app.logInformation("Tahoma Login",
                {
                    message: "Start OAuth Login",
                    stack: {attempts: this.loginAttempts, blocked: this.loginsBlocked, linkURL: linkurl}
                });
    
                //Clear the headers and use credentials
                HttpHelper.setDefaultHeaders({}, true);

                let formData = {
                    grant_type: 'password',
                    username: username,
                    password: password,
                    client_id: Homey.env.SOMFY_OAUTH_CLIENT_ID,
                    client_secret: Homey.env.SOMFY_OAUTH_CLIENT_SECRET,
                };

                const data = encodeForm((formData));

                const config = {
                    headers:
                    {
                        'content-type': 'application/x-www-form-urlencoded',
                        'content-length': data.length,
                        'host': 'accounts.somfy.com',
                        'User-Agent': 'homey'
                    }
                };

                // Throws an exception if login fails
                const result = await HttpHelper.postLogin(Homey.env.SOMFY_OAUTH_URL, config, data)

                // Setup the token header and stop using token cookie
                const headers = {
                    Authorization: "Bearer " + result['access_token']
                };

                HttpHelper.setDefaultHeaders(headers, false);
                
                Homey.app.logInformation("Tahoma OAuth Login",
                {
                    message: "Successful",
                    stack: result
                });
            }
        }
        catch (error)
        {
            HttpHelper.setAuthenticating(false);
            throw (error);
        }

        // Login OK if we get to here so reset the attempted login counters
        this.loginAttempts = 0;
        this.loginsBlocked = 0;

        // Return the method use to login
        return oauthLogin;
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
            if (process.env.DEBUG === '1')
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

    // Returns null if it fails or a it's new registration so the devices need to fetch their data,
    // or returns an array of status changes since the las call, which maybe an empty array if nothing has changed
    static async getEvents(lastFailed = false)
    {
        if (Homey.app.loggedIn)
        {
            // Check to see if the events are already being registered by another 'task'
            if (this.registeringEvents)
            {
                Homey.app.logInformation("Registering Events",
                {
                    message: "Waiting..",
                    stack: ""
                });
                while (this.registeringEvents)
                {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (!this.registerResponse || !this.registerResponse.id)
            {
                // Events are not registered yet
                this.registeringEvents = true;
                Homey.app.logInformation("Registering Events",
                {
                    message: "Starting",
                    stack: ""
                });
                try
                {
                    this.registerResponse = await HttpHelper.post('/events/register');
                    Homey.app.logInformation("Register Events",
                    {
                        message: "Success",
                        stack: this.registerResponse
                    });
                    this.registeringEvents = false;

                    // return null so the devices fetch the status data
                    return null;
                }
                catch (error)
                {
                    this.registerResponse = null;
                    Homey.app.logInformation("Register Events",
                    {
                        message: error.message,
                        stack: error.stack
                    });
                    this.registeringEvents = false;
                    return null;
                }
            }

            try
            {
                Homey.app.logInformation("Fetch Events",
                {
                    message: "Starting",
                    stack: ""
                });
                const events = await HttpHelper.post('/events/' + this.registerResponse.id + '/fetch');
                if (events === undefined)
                {
                    throw (new Error("Undefined response for /fetch"));
                }

                Homey.app.logInformation("Fetch Events",
                {
                    message: "Complete",
                    stack: events
                });
                return events;
            }
            catch (error)
            {
                this.registerResponse = null;
                if (!lastFailed)
                {
                    // Try once more to re-register and get again
                    return await this.getEvents(true);
                }
                Homey.app.logInformation("Fetch Events",
                {
                    message: error.message,
                    stack: error.stack
                });
                return null;
            }
        }
        throw (new Error("Not Logged in"));
    }

    static async refreshStates()
    {
        if (Homey.app.loggedIn)
        {
            await HttpHelper.post('/setup/devices/states/refresh');
        }
        throw (new Error("Not Logged in"));
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
Tahoma.loginAttempts = 0;
Tahoma.loginsBlocked = 0;
Tahoma.loginTimerID = null;
Tahoma.registerResponse = null;

module.exports = Tahoma;
const HttpHelper = require('./HttpHelper');