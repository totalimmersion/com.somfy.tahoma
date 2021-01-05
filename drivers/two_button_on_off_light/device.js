'use strict';

const Device = require('../Device');
const Tahoma = require('../../lib/Tahoma');
const Homey = require('homey');

/**
 * Device class for the remote controller with the "enocean:EnOceanOnOffLight" controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class two_button_on_offDevice extends Device
{
    async onInit()
    {
        await super.onInit();
        this.registerCapabilityListener('on_button', this.onCapabilityOn.bind(this));
        this.registerCapabilityListener('off_button', this.onCapabilityOff.bind(this));
        this.registerCapabilityListener('on_with_timer', this.sendOnWithTimer.bind(this));

        this.setCapabilityValue( 'on_with_timer', 0 );
    }

    async onCapabilityOn(value)
    {
        if (this.commandExecuting === 'on')
        {
            // This command is still processing
            return;
        }

        return this.sendOnOff(true);
    }

    async onCapabilityOff(value)
    {
        if (this.commandExecuting === 'off')
        {
            // This command is still processing
            return;
        }

        return this.sendOnOff(false);
    }

    async sendOnOff(value)
    {
        if (this.onTime)
        {
            clearTimeout(this.onTime);
            this.setCapabilityValue( 'on_with_timer', 0 );
        }

        if (this.boostSync)
        {
            await Homey.app.boostSync();
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            // Wait for previous command to complete
            let retries = 20;
            while ((this.executionId !== null) && (retries-- > 0))
            {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        var action;
        if (value == false)
        {
            action = {
                name: 'off',
                parameters: []
            };
        }
        else
        {
            action = {
                name: 'on',
                parameters: []
            };
        }
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
            Homey.app.logInformation(this.getName() + ": sendOnOff", "Failed to send command");
            if (this.boostSync)
            {
                await Homey.app.unBoostSync();
            }
            throw (new Error("Failed to send command"));
        }
    }

    async sendOnWithTimer(value)
    {
        if (value == 0)
        {
            return this.onCapabilityOff(false);
        }

        if (this.onTime)
        {
            clearTimeout(this.onTime);
        }

        if (this.boostSync)
        {
            await Homey.app.boostSync();
        }

        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            // Wait for previous command to complete
            let retries = 20;
            while ((this.executionId !== null) && (retries-- > 0))
            {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        var action;
        action = {
            name: 'onWithTimer',
            parameters: [value]
        };

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

                this.doOnTimer();
            }
        }
        else
        {
            Homey.app.logInformation(this.getName() + ": sendOnWithTimer", "Failed to send command");
            if (this.boostSync)
            {
                await Homey.app.unBoostSync();
            }

            this.doOnTimer();

            this.setCapabilityValue( 'on_with_timer', 0 );
            throw (new Error("Failed to send command"));
        }
    }

    doOnTimer()
    {
        this.onTime = setTimeout(() =>
        {
            let timeRemaining = this.getCapabilityValue('on_with_timer');

            if (timeRemaining > 0)
            {
                this.setCapabilityValue( 'on_with_timer', timeRemaining - 1 );
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
        for (var i = 0; i < events.length; i++)
        {
            const element = events[i];
            if (element['name'] === 'ExecutionStateChangedEvent')
            {
                if ((element['newState'] === 'COMPLETED') || (element['newState'] === 'FAILED'))
                {
                    if (this.executionId === element['execId'])
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

module.exports = two_button_on_offDevice;