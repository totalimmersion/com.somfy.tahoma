/* jslint node: true */

'use strict';

module.exports = {
    async login({ homey, body })
    {
        return homey.app.newLogin(body);
    },
    async logout({ homey, body })
    {
        return homey.app.logOut();
    },
    async GetDeviceLog({ homey, body })
    {
        return homey.app.logDevices();
    },
    async SendDeviceLog({ homey, body })
    {
        return homey.app.sendLog('deviceLog');
    },
    async SendInfoLog({ homey, body })
    {
        return homey.app.sendLog('infoLog');
    },
};
