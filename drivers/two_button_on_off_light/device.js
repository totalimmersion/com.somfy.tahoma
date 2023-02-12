/* jslint node: true */

'use strict';

const Device = require('../Device');

// eslint-disable-next-line camelcase
class two_button_on_offDevice extends Device
{

    async onInit()
    {
        await super.onInit();
        this.boostSync = true;
        this.registerCapabilityListener('on_button', this.onCapabilityOn.bind(this));
        this.registerCapabilityListener('off_button', this.onCapabilityOff.bind(this));
        this.registerCapabilityListener('on_with_timer', this.sendOnWithTimer.bind(this));

        this.setCapabilityValue('on_with_timer', 0).catch(this.error);
    }

    async onCapabilityOn(value)
    {
        if (this.commandExecuting === 'on')
        {
            // This command is still processing
            return;
        }

        this.sendOnOff(true);
    }

    async onCapabilityOff(value)
    {
        if (this.commandExecuting === 'off')
        {
            // This command is still processing
            return;
        }

        this.sendOnOff(false);
    }

    async sendOnOff(value)
    {
        if (this.onTime)
        {
            clearTimeout(this.onTime);
            this.setCapabilityValue('on_with_timer', 0).catch(this.error);
        }

        if (this.boostSync)
        {
            if (!await this.homey.app.boostSync())
            {
                throw (new Error('Failed to Boost Sync'));
            }
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            // Wait for previous command to complete
            let retries = 20;
            while ((this.executionId !== null) && (retries-- > 0))
            {
                await this.homey.app.asyncDelay(500);
            }
        }

        let action;
        if (value === false)
        {
            action = {
                name: 'off',
                parameters: [],
            };
        }
        else
        {
            action = {
                name: 'on',
                parameters: [],
            };
        }
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
            this.homey.app.logInformation(`${this.getName()}: sendOnOff`, 'Failed to send command');
            if (this.boostSync)
            {
                await this.homey.app.unBoostSync();
            }
            throw (new Error('Failed to send command'));
        }
    }

    async sendOnWithTimer(value)
    {
        if (value === 0)
        {
            this.onCapabilityOff(false);
            return;
        }

        if (this.onTime)
        {
            clearTimeout(this.onTime);
        }

        if (this.boostSync)
        {
            if (!await this.homey.app.boostSync())
            {
                throw (new Error('Failed to Boost Sync'));
            }
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            // Wait for previous command to complete
            let retries = 20;
            while ((this.executionId !== null) && (retries-- > 0))
            {
                await this.homey.app.asyncDelay(500);
            }
        }

        const action = {
            name: 'onWithTimer',
            parameters: [value],
        };

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

                this.doOnTimer();
            }
        }
        else
        {
            this.homey.app.logInformation(`${this.getName()}: sendOnWithTimer`, 'Failed to send command');
            if (this.boostSync)
            {
                await this.homey.app.unBoostSync();
            }

            this.doOnTimer();

            this.setCapabilityValue('on_with_timer', 0).catch(this.error);
            throw (new Error('Failed to send command'));
        }
    }

    doOnTimer()
    {
        this.onTime = this.homey.setTimeout(() =>
        {
            const timeRemaining = this.getCapabilityValue('on_with_timer');

            if (timeRemaining > 0)
            {
                this.setCapabilityValue('on_with_timer', timeRemaining - 1).catch(this.error);
                this.doOnTimer();
            }
        }, 60000);
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
                        if (this.executionId !== element.execId)
                        {
                            this.executionId = element.execId;
                            this.executionCmd = element.actions[x].commands[0].name;
                            if (this.boostSync)
                            {
                                if (!await this.homey.app.boostSync())
                                {
                                    this.executionCmd = '';
                                    this.executionId = null;
                                }
                            }
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

// eslint-disable-next-line camelcase
module.exports = two_button_on_offDevice;
