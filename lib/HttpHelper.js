/*jslint node: true */
'use strict';
const
{
    SimpleClass,
    ManagerSettings,
    ManagerI18n
} = require('homey');

const Homey = require('homey');
const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;
let instance = null;
let authenticating = false;
let authenticated = false;

class HttpHelper extends SimpleClass
{
    constructor()
    {
        if (!instance)
        {
            super();
            instance = this;
        }
        this.setBaseURL(Homey.ManagerSettings.get('linkurl'));
        return instance;
    }

    setDefaultHeaders(headers, withCredentials)
    {
        axios.defaults.withCredentials = withCredentials;
        axios.defaults.headers = headers;
        if (!withCredentials)
        {
            cookieJar.removeAllCookies();
        }
    }

    setBaseURL(linkUrlOption)
    {
        axios.defaults.baseURL = this.getBaseURL(linkUrlOption);
    }

    // Convert the host option into the host name
    getBaseURL(linkUrlOption)
    {
        if (linkUrlOption === 'alt1')
        {
            return 'https://ha201-1.overkiz.com/enduser-mobile-web/enduserAPI';
        }
        else if (linkUrlOption === 'alt2')
        {
            return 'https://ha110-1.overkiz.com/enduser-mobile-web/enduserAPI';
        }
        return 'https://www.tahomalink.com/enduser-mobile-web/enduserAPI';
    }

    // Convert the host option into the host name
    getHostName(linkUrlOption)
    {
        if (linkUrlOption === 'alt1')
        {
            return 'ha201-1.overkiz.com';
        }
        else if (linkUrlOption === 'alt2')
        {
            return 'ha110-1.overkiz.com';
        }
        return 'www.tahomalink.com';
    }

    async checkAuthentication(doLogin)
    {
        if (authenticated || !doLogin)
        {
            // Already authenticated or just checking
            return authenticated;
        }

        if (authenticating)
        {
            // Wait for current authentication to finish. Max (40 * 500ms) 20s
            console.log("Awaiting Auth -- Start");
            let retries = 40;
            while (authenticating)
            {
                await Homey.app.syncDelay(500);

                if (retries-- <= 0)
                {
                    throw (new Error("Failed to authenticate"));
                }
            }
            console.log("Awaiting Auth -- Finish");
        }
        else
        {
            // Authenticate again
            authenticating = true;
            var error = await this.reAuthenticate();
            authenticating = false;
        }

        if (!authenticated)
        {
            throw (new Error("Failed to authenticate"));
        }

        return authenticated;
    }

    clearAuthenticated()
    {
        authenticated = false;
    }

    // Throw an error if already authenticating
    setAuthenticating(state)
    {
        authenticating = state;
    }

    async get(uri, config, firstTime = true)
    {
        // Make sure we are authenticated. Throws an error if authentication fails
        await this.checkAuthentication(true);

        try
        {
            if (Homey.app.infoLogEnabled)
            {
                Homey.app.logInformation("get",
                {
                    message: uri,
                    stack: config
                });
            }

            // Throws an error if the get fails
            const response = await axios.get(uri, config);
            return response.data;
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                // Not authorised. Try to log in again
                authenticated = false;
                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("get",
                    {
                        message: "Access token expired -> logging in again",
                        stack: axios.defaults.baseURL + uri
                    });
                }

                // log in again. Throws an error if authentication fails
                await this.checkAuthentication(true);

                // Throws an error if the get fails
                const response = await axios.get(uri, config);
                return response.data;
            }
        }
    }

    async post(uri, config, data, firstTime = true)
    {
        // Make sure we are authenticated. Throws an error if authentication fails
        await this.checkAuthentication(true);

        try
        {
            if (Homey.app.infoLogEnabled)
            {
                Homey.app.logInformation("post",
                {
                    message: uri,
                    stack: data
                });
            }

            // Throws an error if the post fails
            const response = await axios.post(uri, data, config);
            return response.data;
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                // Not authorised. Try to log in again
                authenticated = false;
                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("post",
                    {
                        message: "Access token expired -> logging in again",
                        stack: axios.defaults.baseURL + uri
                    });
                }

                // log in again. Throws an error if authentication fails
                await this.checkAuthentication(true);

                // Throws an error if the post fails
                const response = await axios.post(uri, data, config);
                return response.data;
            }
            else if (error.response && error.response.status === 400)
            {
                Homey.app.logInformation("post",
                {
                    message: "Invalid data",
                    stack: { "uri": uri, "config": config, "data": data }
                });
            }
        }
    }

    // Post a new login request
    async postLogin(uri, config, data)
    {
        try
        {
            // Throws an error if the post fails
            const response = await axios.post(uri, data, config);

            // Must have been successful to get here
            authenticated = true;
            authenticating = false;
            return response.data;
        }
        catch (error)
        {
            Homey.app.logInformation("postLogin", error);

            //Authentication failed
            Homey.app.logInformation("postLogin",
            {
                message: "Authentication failed",
                stack: "Ensure the Username and Password are entered correctly in the Apps Configuration page."
            });
            authenticating = false;
            throw (error);
        }
    }

    async delete(uri, config, firstTime = true)
    {
        await this.checkAuthentication(true);

        try
        {
            return await axios.delete(uri, config);
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                authenticated = false;
                if (Homey.app.infoLogEnabled)
                {
                    //no longer authenticated -> login again
                    Homey.app.logInformation("delete",
                    {
                        message: "Access token expired -> logging in again",
                        stack: axios.defaults.baseURL + uri
                    });
                }

                // log in again. Throws an error if authentication fails
                await this.checkAuthentication(true);

                // Try the transaction again
                return await axios.delete(uri, config);
            }
        }
    }

    async reAuthenticate()
    {
        const username = ManagerSettings.get('username');
        const password = ManagerSettings.get('password');
        const linkURL = Homey.ManagerSettings.get('linkurl');
        const loginMethod = Homey.ManagerSettings.get('loginMethod');

        try
        {
            // Throws an error on failure
            await Tahoma.login(username, password, linkURL, loginMethod);
            authenticated = true;
            return null;
        }
        catch (error)
        {
            return error;
        }
    }
}
module.exports = new HttpHelper();
const Tahoma = require('./Tahoma');