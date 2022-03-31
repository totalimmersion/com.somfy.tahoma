/* jslint node: true */

'use strict';

const
{
    SimpleClass,
} = require('homey');

const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);

module.exports = class HttpHelper extends SimpleClass
{

    constructor(Homey)
    {
        super();

        this.homey = Homey;
        this.authenticating = false;
        this.authenticated = false;

        this.cookieJar = new tough.CookieJar();
        this.axios = axios.create();
        this.axios.defaults.jar = this.cookieJar;
        this.axios.defaults.withCredentials = true;

        this.setBaseURL(this.homey.settings.get('linkurl'));
        return this;
    }

    setDefaultHeaders(headers, withCredentials)
    {
        this.axios.defaults.withCredentials = withCredentials;
        this.axios.defaults.headers = headers;
        if (!withCredentials)
        {
            this.cookieJar.removeAllCookies();
        }
    }

    setBaseURL(linkUrlOption)
    {
        this.axios.defaults.baseURL = this.getBaseURL(linkUrlOption);
        this.axios.defaults.timeout = 10000;
    }

    // Convert the host option into the host name
    getBaseURL(linkUrlOption)
    {
        if (linkUrlOption === 'alt1')
        {
            return 'https://ha201-1.overkiz.com/enduser-mobile-web/enduserAPI';
        }
        if (linkUrlOption === 'alt2')
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
        if (linkUrlOption === 'alt2')
        {
            return 'ha110-1.overkiz.com';
        }
        return 'www.tahomalink.com';
    }

    async checkAuthentication(doLogin)
    {
        let error = '';

        if (this.authenticating)
        {
            // Wait for current authentication to finish. Max (40 * 500ms) 20s
            if (this.homey.app.infoLogEnabled)
            {
                this.homey.app.logInformation('checkAuthentication',
                {
                    message: 'Awaiting Auth -- Start',
                });
            }
            let retries = 40;
            while (this.authenticating)
            {
                await this.homey.app.asyncDelay(500);

                if (retries-- <= 0)
                {
                    throw (new Error('Failed to authenticate. Previous authentication is taking too long'));
                }
            }
            if (this.homey.app.infoLogEnabled)
            {
                this.homey.app.logInformation('checkAuthentication',
                {
                    message: 'Awaiting Auth -- Finish',
                });
            }
        }
        else
        {
            const oAuthTimeLeft = this.homey.app.tahoma.getOAuthTimeLeft();
            if (doLogin && (oAuthTimeLeft > -1) && (oAuthTimeLeft < 60))
            {
                this.authenticated = false;
                await this.homey.app.tahoma.refreshOAuth();
            }

            if (this.authenticated || !doLogin)
            {
                // Already authenticated or just checking
                return this.authenticated;
            }

            // Authenticate again
            this.authenticating = true;
            error = await this.reAuthenticate();
            this.authenticating = false;
        }

        if (!this.authenticated)
        {
            throw (new Error(`Failed to authenticate: ${error}`));
        }

        return this.authenticated;
    }

    clearAuthenticated()
    {
        this.authenticated = false;
    }

    // Throw an error if already this.authenticating
    setAuthenticating(state)
    {
        this.authenticating = state;
    }

    async get(uri, config, checkAuth = true)
    {
        if (checkAuth)
        {
            // Make sure we are this.authenticated. Throws an error if authentication fails
            await this.checkAuthentication(true);
        }

        try
        {
            if (this.homey.app.infoLogEnabled)
            {
                this.homey.app.logInformation('get',
                {
                    message: uri,
                });
            }

            // Throws an error if the get fails
            const response = await this.axios.get(uri, config);
            return response.data;
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                // Not authorised. Try to log in again
                this.authenticated = false;
                if (this.homey.app.infoLogEnabled)
                {
                    this.homey.app.logInformation('get',
                    {
                        message: 'Access token expired -> logging in again',
                        stack: this.axios.defaults.baseURL + uri,
                    });
                }

                // log in again. Throws an error if authentication fails
                await this.checkAuthentication(true);

                // Throws an error if the get fails
                const response = await this.axios.get(uri, config);
                return response.data;
            }

            this.homey.app.logInformation('get',
            {
                message: 'Error sending command.',
                stack:
                {
                    Error: error.stack,
                    uri
                },
            });
        }

        return null;
    }

    async post(uri, config, data, firstTime = true)
    {
        // Make sure we are this.authenticated. Throws an error if authentication fails
        await this.checkAuthentication(true);

        try
        {
            if (this.homey.app.infoLogEnabled)
            {
                this.homey.app.logInformation('post',
                {
                    message: uri,
                    stack: data !== undefined ? data : '',
                });
            }

            // Throws an error if the post fails
            const response = await this.axios.post(uri, data, config);
            return response.data;
        }
        catch (error)
        {
            if (error.response)
            {
                if (error.response.status === 401)
                {
                    if (firstTime)
                    {
                        // Not authorised. Try to log in again
                        this.authenticated = false;
                        if (this.homey.app.infoLogEnabled)
                        {
                            this.homey.app.logInformation('post',
                            {
                                message: 'Access token expired -> logging in again',
                                stack: this.axios.defaults.baseURL + uri,
                            });
                        }

                        return this.post(uri, config, data, false);
                    }
                }
            }

            this.homey.app.logInformation('post',
            {
                message: 'Error sending command.',
                stack:
                {
                    Error: error.stack,
                    uri,
                    data,
                },
            });

            throw (error);
        }
    }

    // Post a new login request
    async postLogin(uri, config, data)
    {
        try
        {
            // Throws an error if the post fails
            const response = await this.axios.post(uri, data, config);

            // Must have been successful to get here
            this.authenticated = true;
            this.authenticating = false;
            return response.data;
        }
        catch (error)
        {
            this.homey.app.logInformation('postLogin', error.message);

            // Authentication failed
            this.homey.app.logInformation('postLogin',
            {
                message: 'Authentication failed',
                stack: 'Ensure the Username and Password are entered correctly in the Apps Configuration page.',
            });
            this.authenticating = false;
            throw (error);
        }
    }

    async delete(uri, config, firstTime = true)
    {
        await this.checkAuthentication(true);

        try
        {
            return await this.axios.delete(uri, config);
        }
        catch (error)
        {
            if (error.response && error.response.status === 401)
            {
                this.authenticated = false;
                if (this.homey.app.infoLogEnabled)
                {
                    // no longer this.authenticated -> login again
                    this.homey.app.logInformation('delete',
                    {
                        message: 'Access token expired -> logging in again',
                        stack: this.axios.defaults.baseURL + uri,
                    });
                }

                // log in again. Throws an error if authentication fails
                await this.checkAuthentication(true);

                // Try the transaction again
                return this.axios.delete(uri, config);
            }
        }

        return null;
    }

    async reAuthenticate()
    {
        const username = this.homey.settings.get('username');
        const password = this.homey.settings.get('password');
        const linkURL = this.homey.settings.get('linkurl');
        const loginMethod = this.homey.settings.get('loginMethod');

        if (this.homey.app.infoLogEnabled)
        {
            this.homey.app.logInformation('reAuthenticate',
            {
                message: 'Logging in again',
                stack: {username, linkURL, loginMethod},
            });
        }

        try
        {
            // Throws an error on failure
            await this.homey.app.tahoma.login(username, password, linkURL, loginMethod, false, true);
            this.authenticated = true;
            return null;
        }
        catch (error)
        {
            return error;
        }
    }

};
