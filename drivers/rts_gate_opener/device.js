/* jslint node: true */

'use strict';

const Device = require('../Device');

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

        this.sendOpenCloseStop('open');
    }

    async onCapabilityClose(value)
    {
        if (this.commandExecuting === 'close')
        {
            // This command is still processing
            return;
        }

        this.sendOpenCloseStop('close');
    }

    async onCapabilityStop(value)
    {
        if (this.commandExecuting === 'stop')
        {
            // This command is still processing
            return;
        }

        this.sendOpenCloseStop('stop');
    }

    async sendOpenCloseStop(value)
    {
        if (this.boostSync)
        {
            await this.homey.app.boostSync();
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            await this.homey.app.tahoma.cancelExecution(this.executionId);
        }

        let action;
        const actionParam = this.getSetting('open_command');
        if (actionParam && value === 'open')
        {
            action = {
                name: actionParam,
                parameters: [],
            };
        }
        else
        {
            action = {
                name: value,
                parameters: [],
            };
        }

        try
        {
            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result)
            {
                if (result.errorCode)
                {
                    this.homey.app.logInformation(this.getName(),
                    {
                        message: result.error,
                        stack: result.errorCode,
                    });

                    if (this.boostSync)
                    {
                        await this.homey.app.unBoostSync();
                    }
                    throw (new Error(result.error));
                }
                else
                {
                    this.commandExecuting = action.name;
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: sendOpenClose`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        catch (err)
        {
            this.homey.app.logInformation(`${this.getName()}: sendOpenClose`, 'Failed to send command');
            if (this.boostSync)
            {
                await this.homey.app.unBoostSync();
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
        for (let i = 0; i < events.length; i++)
        {
            const element = events[i];
            if (element.name === 'ExecutionRegisteredEvent')
            {
                for (let x = 0; x < element.actions.length; x++)
                {
                    if (myURL === element.actions[x].deviceURL)
                    {
                        this.executionId = element.execId;
                        this.executionCmd = element.actions[x].commands[0].name;
                        if (this.boostSync)
                        {
                            await this.homey.app.boostSync();
                        }
                    }
                }
            }
            else if (element.name === 'ExecutionStateChangedEvent')
            {
                if ((element.newState === 'COMPLETED') || (element.newState === 'FAILED'))
                {
                    if (this.executionId === element.execId)
                    {
                        if (this.boostSync)
                        {
                            await this.homey.app.unBoostSync();
                        }

                        this.homey.app.triggerCommandComplete(this, this.executionCmd, (element.newState === 'COMPLETED'));
                        this.driver.triggerDeviceCommandComplete(this, this.executionCmd, (element.newState === 'COMPLETED'));
                        this.commandExecuting = '';
                        this.executionId = null;
                        this.executionCmd = '';
                    }
                }
            }
        }

        return myURL;
    }

}

module.exports = rtsGateOpenerDevice;
