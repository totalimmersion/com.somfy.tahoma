/*jslint node: true */
'use strict';

const Device = require('../Device');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

class rtsGateOpenerDevice extends Device
{
    async onInit()
    {
        await super.onInit();
        this.registerCapabilityListener('open_button', this.onCapabilityOpen.bind(this));
        this.registerCapabilityListener('close_button', this.onCapabilityClose.bind(this));
        this.registerCapabilityListener('stop_button', this.onCapabilityStop.bind(this));

        this.boostSync = true;
    }

    async onCapabilityOpen(value)
    {
        if (this.commandExecuting === 'open')
        {
            // This command is still processing
            return;
        }

        return this.sendOpenCloseStop('open');
    }

    async onCapabilityClose(value)
    {
        if (this.commandExecuting === 'close')
        {
            // This command is still processing
            return;
        }

        return this.sendOpenCloseStop('close');
    }

    async onCapabilityStop(value)
    {
        if (this.commandExecuting === 'stop')
        {
            // This command is still processing
            return;
        }

        return this.sendOpenCloseStop('stop');
    }

    async sendOpenCloseStop(value)
    {
        if (this.boostSync)
        {
            await Homey.app.boostSync();
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            await Tahoma.cancelExecution(this.executionId);
        }

        var action;
        let actionParam = this.getSetting('open_command');
        if (actionParam && value === 'open')
        {
            action = {
                name: actionParam,
                parameters: []
            };
        }
        else
        {
            action = {
                name: value,
                parameters:[]
            };

        }

        try
        {
            let result = await Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result !== undefined)
            {
                if (result.errorCode)
                {
                    Homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode
                    });

                    if (this.boostSync)
                    {
                        await Homey.app.unBoostSync();
                    }
                    throw (new Error(result.error));
                }
                else
                {
                    this.commandExecuting = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                Homey.app.logInformation(this.getName() + ": sendOpenClose", "Failed to send command");
                if (this.boostSync)
                {
                    await Homey.app.unBoostSync();
                }
                throw (new Error("Failed to send command"));
            }
        }
        catch (err)
        {
            Homey.app.logInformation(this.getName() + ": sendOpenClose", "Failed to send command");
            if (this.boostSync)
            {
                await Homey.app.unBoostSync();
            }
            throw (err);
        }
    }

    // look for updates in the events array
    async syncEvents(events)
    {
        if (events === null)
        {
            return this.sync();
        }

        const myURL = this.getDeviceUrl();

        // Process events sequentially so they are in the correct order
        for (var i = 0; i < events.length; i++)
        {
            const element = events[i];
            if (element.name === 'ExecutionStateChangedEvent')
            {
                if ((element.newState === 'COMPLETED') || (element.newState === 'FAILED'))
                {
                    if (this.executionId === element.execId)
                    {
                        if (this.boostSync)
                        {
                            await Homey.app.unBoostSync();
                        }
                        this.commandExecuting = '';
                        this.executionId = null;
                    }
                }
            }
        }

        return myURL;
    }

}

module.exports = rtsGateOpenerDevice;