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
    static loginAttempts = 0;
    static loginsBlocked = 0;
    static loginTimerID = null;
    // Throws an error if the login fails
    static async login(username, password, linkurl, oauthLogin, ignoreBlock = false)
    {
        if (await HttpHelper.checkAuthentication(false))
        {
            // Already authenticated. Logout first to do a new login
            return;
        }
        // Keep track of the number of login attempts
        this.loginAttempts++;
        if (this.loginTimerID === null)
        {
            // 10 seconds timer to reset login counter
            this.loginTimerID = setTimeout(() =>
            {
                if (this.loginAttempts > 5)
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
            }, this.loginsBlocked > 3 ? 300000 : 10000); // If the login has been blocked too many times then set a 5 minute timeout
        }
        // Allow up to 5 login attempts in 10 seconds
        if ((this.loginAttempts > 5) || (!ignoreBlock && (this.loginsBlocked > 3)))
        {
            throw (new Error(this.loginsBlocked > 3 ? "Far Too many login attempts (blocked for 5 minutes)" : "Too many login attempts (blocked for 10 seconds)"));
        }
        HttpHelper.setAuthenticating(true);
        Homey.app.logInformation("Tahoma Login"
            , {
                message: "Start"
                , stack: ""
            });
        HttpHelper.setBaseURL(linkurl);
        this.registerResponse = null;
        this.registeringEvents = false;
        const encodeForm = (data) =>
        {
            return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
        }
        if (!oauthLogin)
        {
            // Use simple login
            //Clear the headers and use credentials
            HttpHelper.setDefaultHeaders({}, true);
            let formData = {
                userId: username
                , userPassword: password
            };
            const data = encodeForm((formData));
            const config = {
                headers:
                {
                    'content-type': 'application/x-www-form-urlencoded'
                    , 'content-length': data.length
                    , 'host': HttpHelper.getHostName(linkurl)
                    , 'User-Agent': 'homey'
                }
            };
            const result = await HttpHelper.postLogin('/login', config, data);
            Homey.app.logInformation("Tahoma Simple Login"
                , {
                    message: "Successful"
                    , stack: result
                });
        }
        else
        {
            //Use OAuth login
            let formData = {
                grant_type: 'password'
                , username: username
                , password: password
                , client_id: Homey.env.SOMFY_OAUTH_CLIENT_ID
                , client_secret: Homey.env.SOMFY_OAUTH_CLIENT_SECRET
            , };
            const data = encodeForm((formData));
            const config = {
                headers:
                {
                    'content-type': 'application/x-www-form-urlencoded'
                    , 'content-length': data.length
                    , 'host': 'accounts.somfy.com'
                    , 'User-Agent': 'homey'
                }
            };
            // Throws an exception if login fails
            const result = await HttpHelper.postLogin(Homey.env.SOMFY_OAUTH_URL, config, data)
            Homey.app.logInformation("Tahoma OAuth Login"
                , {
                    message: "Successful"
                    , stack: result
                });
            const headers = {
                Authorization: "Bearer " + result['access_token']
            };
            HttpHelper.setDefaultHeaders(headers, false);
        }
    }
    static async logout()
    {
        try
        {
            await HttpHelper.post('/logout');
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
                label: name + ' - ' + action.name + '  - Homey'
                , actions: [
                {
                    deviceURL: deviceUrl
                    , commands: [
                        action
                    ]
                }]
            };
            const options = {
                json: true
            , };
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
    static async getEvents(lastFailed = false)
    {
        if (Homey.app.loggedIn)
        {
            if (this.registeringEvents)
            {
                Homey.app.logInformation("Registering Events"
                    , {
                        message: "Waiting.."
                        , stack: ""
                    });
                while (this.registeringEvents)
                {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            if (!this.registerResponse || !this.registerResponse.id)
            {
                this.registeringEvents = true;
                Homey.app.logInformation("Registering Events"
                    , {
                        message: "Starting"
                        , stack: ""
                    });
                try
                {
                    this.registerResponse = await HttpHelper.post('/events/register');
                    Homey.app.logInformation("Register Events"
                        , {
                            message: "Success"
                            , stack: this.registerResponse
                        });
                    this.registeringEvents = false;
                }
                catch (error)
                {
                    this.registerResponse = null;
                    Homey.app.logInformation("Register Events"
                        , {
                            message: error.message
                            , stack: error.stack
                        });
                    this.registeringEvents = false;
                    return null;
                }
            }
            try
            {
                Homey.app.logInformation("Fetch Events"
                    , {
                        message: "Starting"
                        , stack: ""
                    });
                const events = await HttpHelper.post('/events/' + this.registerResponse.id + '/fetch');
                Homey.app.logInformation("Fetch Events"
                    , {
                        message: "Complete"
                        , stack: events
                    });
                return events;
            }
            catch (error)
            {
                this.registerResponse = null;
                if (!lastFailed)
                {
                    // Try once more to re-register and get again
                    return this.getEvents(true);
                }
                Homey.app.logInformation("Fetch Events"
                    , {
                        message: error.message
                        , stack: error.stack
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
            this.registerResponse = await HttpHelper.post('/setup/devices/states/refresh');
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
module.exports = Tahoma;
const HttpHelper = require('./HttpHelper');