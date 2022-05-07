/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the io_dimmable_light controllable, hue:GenericDimmableLightHUEComponent or io:DimmableLightMicroModuleSomfyIOComponent name in TaHoma
 * @extends {LightControllerDevice}
 */

class DimmableLightControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        await super.onInit();
        const dd = this.getData();
        let controllableName = '';
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if (controllableName === 'ogp:light')
        {
            if (this.hasCapability('onoff'))
            {
                this.removeCapability('onoff');
            }
        }

        if (controllableName !== 'io:dimmablelightmicromodulesomfyiocomponent')
        {
            if (this.hasCapability('on_with_timer'))
            {
                this.removeCapability('on_with_timer');
            }
        }
        else
        {
            this.registerCapabilityListener('on_with_timer', this.sendOnWithTimer.bind(this));
            this.setCapabilityValue('on_with_timer', 0).catch(this.error);
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
}

module.exports = DimmableLightControllerDevice;
