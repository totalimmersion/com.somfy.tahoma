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
        if (authenticated)
        {
            return true;
        }
        if (doLogin)
        {
            if (authenticating)
            {
                // Wait for current authentication to finish. Max (40 * 500ms) 20s
                console.log("Awaiting Auth -- Start");
                let retries = 40;
                while (authenticating && retries > 0)
                {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    retries--;
                }
                console.log("Awaiting Auth -- Finish");
            }

            if (authenticated)
            {
                return true;
            }

            authenticating = true;
            await this.reAuthenticate();
            authenticating = false;
        }
        return authenticated;
    }
    clearAuthenticated()
    {
        authenticated = false;
    }
    setAuthenticating(state)
    {
        authenticating = state;
    }

    async get(uri, config, firstTime = true)
    {
        if (!await this.checkAuthentication(true))
        {
            throw (new Error("Get: Failed to login"));
        }
        try
        {
            Homey.app.logInformation("get",
            {
                message: uri,
                stack: config
            });
            const response = await axios.get(uri, config)
            return response.data;
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                // Not authorised
                authenticated = false;
                if (firstTime)
                {
                    //First attempt so login and try again
                    Homey.app.logInformation("get",
                    {
                        message: "Access token expired -> logging in again",
                        stack: axios.defaults.baseURL + uri
                    });

                    if (!await this.checkAuthentication(true))
                    {
                        throw (new Error("Get: Failed to login"));
                    }

                    return await this.get(uri, config, false);
                }
                else
                {
                    Homey.app.logInformation("get",
                    {
                        message: error.message,
                        stack: axios.defaults.baseURL + uri
                    });

                    throw (error);
                }
            }
        }
    }

    async post(uri, config, data, firstTime = true)
    {
        if (!await this.checkAuthentication(true))
        {
            throw (new Error("Post: Failed to login"));
        }

        try
        {
            Homey.app.logInformation("post",
            {
                message: uri,
                stack: data
            });
            const response = await axios.post(uri, data, config)
            return response.data;
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                // Not authorised
                authenticated = false;
                if (firstTime)
                {
                    //First time so login and try again
                    Homey.app.logInformation("post",
                    {
                        message: "Access token expired -> logging in again",
                        stack: axios.defaults.baseURL + uri
                    });

                    if (!await this.checkAuthentication(true))
                    {
                        throw (new Error("Get: Failed to login"));
                    }

                    //Try the original post again
                    return await this.post(uri, config, data, false);
                }
                else
                {
                    if (!error.response || error.response.status !== 400 || uri.indexOf('/fetch') === -1)
                    {
                        Homey.app.logInformation("post",
                        {
                            message: error.message,
                            stack: axios.defaults.baseURL + uri
                        });
                    }
                    throw (error);
                }
            }
        }
    }

    // Post a new login request
    async postLogin(uri, config, data)
    {
        try
        {
            const response = await axios.post(uri, data, config)
            // Must have been successful to get here
            authenticated = true;
            authenticating = false;
            return response.data;
        }
        catch (error)
        {
            Homey.app.logInformation("postLogin", error);
            //Authentication failed
            Homey.app.logInformation("post",
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
        if (!await this.checkAuthentication(true))
        {
            throw (new Error("Post: Failed to login"));
        }
        try
        {
            return await axios.delete(uri, config)
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                authenticated = false;
                if (firstTime)
                {
                    //no longer authenticated -> login again
                    Homey.app.logInformation("delete",
                    {
                        message: "Access token expired -> logging in again",
                        stack: axios.defaults.baseURL + uri
                    });
                    //no longer authenticated -> login again
                    if (!await this.checkAuthentication(true))
                    {
                        throw (new Error("Get: Failed to login"));
                    }
                    return await this.delete(uri, config, false);
                }
                else
                {
                    Homey.app.logInformation("delete",
                    {
                        message: error.message,
                        stack: axios.defaults.baseURL + uri
                    });
                    throw (error);
                }
            }
        }
    }

    async reAuthenticate()
    {
        const username = ManagerSettings.get('username');
        const password = ManagerSettings.get('password');
        const linkurl = Homey.ManagerSettings.get('linkurl');
        const loginMethod = Homey.ManagerSettings.get('loginMethod');
        try
        {
            await Tahoma.login(username, password, linkurl, loginMethod);
            authenticated = true;
        }
        catch (error)
        {
            throw (error);
        }
    }
}
module.exports = new HttpHelper();
const Tahoma = require('./Tahoma');