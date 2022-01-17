/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the io_dimmable_light controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class ColorTemperatureLightControllerDevice extends LightControllerDevice
{

    async onInit()
    {
        this.hueDelayTimerId = null;

        this.registerCapabilityListener('light_hue', this.onCapabilityLight_hue.bind(this));
        this.registerCapabilityListener('light_saturation', this.onCapabilityLight_saturation.bind(this));
        this.registerCapabilityListener('light_mode', this.onCapabilityLight_mode.bind(this));
    }

    async onCapabilityLight_hue(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            // Delay hue as the UI send both hue and saturation. Flows will only send one
            if (!opts.timer)
            {
                this.log('Hue delayed: ', this.hueDelayTimerId);
                if (this.hueDelayTimerId)
                {
                    clearTimeout(this.hueDelayTimerId);
                    this.hueDelayTimerId = null;
                }
                opts.timer = true;
                this.hueDelayTimerId = this.homey.setTimeout(() => this.onCapabilityLight_hue(value, opts), 1000);
                return;
            }

            if (this.commandExecuting === 'light_hue')
            {
                // This command is still processing
                return;
            }

            if (this.boostSync)
            {
                await this.homey.app.boostSync();
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

            const saturation = this.getState().light_saturation;
            const action = {
                name: 'setHueAndSaturation',
                parameters: [Math.round(value * 360), saturation * 100],
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
                    this.commandExecuting = 'light_hue';
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityLight_hue`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('light_hue', value).catch(this.error);
        }
    }

    async onCapabilityLight_saturation(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.hueDelayTimerId)
            {
                clearTimeout(this.hueDelayTimerId);
                this.hueDelayTimerId = null;
                this.log('Hue cleared');
            }

            this.log('saturation run');

            if (this.commandExecuting === 'light_saturation')
            {
                // This command is still processing
                return;
            }

            if (this.boostSync)
            {
                await this.homey.app.boostSync();
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

            const { hue } = this.getState();
            const action = {
                name: 'setHueAndSaturation',
                parameters: [hue * 360, value * 100],
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
                    this.commandExecuting = 'light_saturation';
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityDim`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            this.setCapabilityValue('light_saturation', value).catch(this.error);
        }
    }

    /**
     * Gets the data from the TaHoma cloud
     */
    async sync()
    {
        try
        {
            const states = await super.getStates();
            if (states)
            {
                // Hue level
                const hueState = states.find(state => (state && (state.name === 'core:ColorHueState')));
                if (hueState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ColorHueState = ${hueState.value}`);
                    this.triggerCapabilityListener('light_hue', (hueState.value / 360),
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                // Saturation level
                const saturationState = states.find(state => (state && (state.name === 'core:ColorSaturationState')));
                if (saturationState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:ColorSaturationState = ${saturationState.value}`);
                    this.triggerCapabilityListener('light_hue', (saturationState.value / 100),
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }
            }
        }
        catch (error)
        {
            this.setUnavailable(error.message).catch(this.error);
            this.homey.app.logInformation(this.getName(),
            {
                message: error.message,
                stack: error.stack,
            });
        }
    }

    async processEventState(deviceState)
    {
        if (super.processEventState(deviceState))
        {
            return true;
        }

        if (deviceState.name === 'core:ColorHueState')
        {
            this.homey.app.logStates(`${this.getName()}: core:ColorHueState = ${deviceState.value}`);
            const oldState = this.getState().light_hue;
            const newSate = (parseInt(deviceState.value, 10) / 360);
            if (oldState !== newSate)
            {
                this.triggerCapabilityListener('light_hue', newSate,
                {
                    fromCloudSync: true,
                }).catch(this.error);
            }
            return true;
        }

        if (deviceState.name === 'core:ColorSaturationState')
        {
            this.homey.app.logStates(`${this.getName()}: core:ColorSaturationState = ${deviceState.value}`);
            const oldState = this.getState().light_saturation;
            const newSate = (parseInt(deviceState.value, 10) / 100);
            if (oldState !== newSate)
            {
                this.triggerCapabilityListener('light_saturation', newSate,
                {
                    fromCloudSync: true,
                }).catch(this.error);
            }
            return true;
        }

        return false;
    }

}

module.exports = ColorTemperatureLightControllerDevice;
