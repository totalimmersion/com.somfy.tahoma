'use strict';
const Homey = require('homey');
const Tahoma = require('./../lib/Tahoma');
/**
 * Base class for devices
 * @extends {Homey.Device}
 */
class Device extends Homey.Device
{
    async onInit()
    {
        this.executionId = null;

        this.log('Device init:', this.getName(), 'class:', this.getClass());
        this.sync();
    }
    onAdded()
    {
        this.log('device added');
    }
    onDeleted()
    {
        if (this.timerId)
        {
            clearTimeout(this.timerId);
        }
        this.log('device deleted');
    }
    /**
     * Returns the TaHoma device url
     * @return {String}
     */
    getDeviceUrl()
    {
        return this.getData().deviceURL;
    }
    /**
     * Returns the io controllable name(s) of TaHoma
     * @return {Array} deviceType
     */
    getDeviceType()
    {
        return this.getDriver().getDeviceType();
    }
    isReady()
    {
        return this._ready;
    }
    async sync()
    {
        try
        {
            if (Homey.app.loggedIn)
            {
                if (this.infoLogEnabled)
                {
                    Homey.app.logInformation("Device initial sync.",
                    {
                        message: this.getName(),
                        stack: ""
                    });
                }
                return await Tahoma.getDeviceStates(this.getDeviceUrl());
            }
        }
        catch (error)
        {
            Homey.app.logInformation("Device initial sync.",
            {
                message: this.getName(),
                stack: error
            });
        }
        // // Try again later
        // this.log('Device sync delayed:', this.getName(), 'class:', this.getClass());
        // this.timerId = setTimeout(() => this.sync(), 1000);
        return null;
    }
}
module.exports = Device;