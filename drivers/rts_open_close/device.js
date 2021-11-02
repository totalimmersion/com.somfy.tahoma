/* jslint node: true */

'use strict';

const Device = require('../Device');

/**
 * Device class for the opening detector with the rts:GarageDoor4TRTSComponent, rts:SlidingGateOpener4TRTSComponent controllable name in TaHoma
 * @extends {SensorDevice}
 */
class OpenCloseDevice extends Device
{

    async onInit()
    {
        this.registerCapabilityListener('button', this.onCapabilityButton.bind(this));
        await super.onInit();
        this.boostSync = true;
    }

    async onCapabilityButton(value)
    {
        const deviceData = this.getData();
        if (this.executionId !== null)
        {
            await this.homey.app.tahoma.cancelExecution(this.executionId);
            return;
        }

        const action = {
            name: 'cycle',
            parameters: [],
        };
        const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
        if (result !== undefined)
        {
            if (result.errorCode)
            {
                this.homey.app.logInformation(this.getName(),
                {
                    message: result.error,
                    stack: result.errorCode,
                });
                throw (new Error(result.error));
            }
            else
            {
                this.executionId = result.execId;
                this.executionCmd = action.name;
                if (this.boostSync)
                {
                    await this.homey.app.boostSync();
                }
            }
        }
        else
        {
            this.homey.app.logInformation(`${this.getName()}: onCapabilityOnOff`, 'Failed to send command');
            throw (new Error('Failed to send command'));
        }
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     * @param {Array} data - device data from all the devices in the TaHoma cloud
     */
    async sync() { return null; }

    // look for updates in the events array
    async syncEvents(events)
    {
        if (events === null)
        {
            this.sync();
            return;
        }

        try
        {
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
                            this.executionId = null;
                            this.executionCmd = '';
                        }
                    }
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

}

module.exports = OpenCloseDevice;
