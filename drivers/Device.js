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

    async onCapability(capabilityXRef, value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            let somfyValue = value;
            if (capabilityXRef.scale)
            {
                somfyValue *= capabilityXRef.scale;
            }

            const deviceData = this.getData();
            var action = {
                name: capabilityXRef.somfyNameSet,
                parameters: [somfyValue]
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
                    this.executionId = result.execId;
                }
            }
            else
            {
                Homey.app.logInformation(this.getName() + ": onCapability " + capabilityXRef.somfyNameSet, "Failed to send command");
                if (this.boostSync)
                {
                    await Homey.app.unBoostSync();
                }
                throw (new Error("Failed to send command"));
            }
        }
        else
        {
            try
            {
                await this.setCapabilityValue(capabilityXRef.homeyName, value);
            }
            catch (err)
            {
                Homey.app.logInformation(this.getName() + ": onCapability " + capabilityXRef.homeyName, err);
            }
        }
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     * Capabilities{somfyNameGet: 'name of the Somfy capability, homeyName: 'name of the Homey capability', compare: 'text for true value or not specified if real value' }
     */
    async syncList(Capabilities)
    {
        try
        {
            const states = await this.getSync();
            if (states)
            {
                // Look for each of the required capabilities
                for (const capability of Capabilities)
                {
                    try
                    {
                        const state = states.find(state => state.name === capability.somfyNameGet);
                        if (state)
                        {
                            // Found the entry
                            Homey.app.logStates(this.getName() + ": " + capability.somfyNameGet + "= " + state.value);
                            await this.triggerCapabilityListener(capability.homeyName, (capability.compare ? (state.value === capability.compare) : (capability.scale ? state.value / capability.scale : state.value)),
                            {
                                fromCloudSync: true
                            });
                        }
                    }
                    catch (error)
                    {
                        Homey.app.logInformation(this.getName(),
                        {
                            message: error.message,
                            stack: error.stack
                        });
                    }
                }
            }
        }
        catch (error)
        {
            Homey.app.logInformation(this.getName(),
            {
                message: error.message,
                stack: error.stack
            });
        }
    }

    // look for updates in the events array
    async syncEventsList(events, Capabilities)
    {
        if (events === null)
        {
            return this.getSync();
        }

        const myURL = this.getDeviceUrl();

        // Process events sequentially so they are in the correct order
        const oldStates = this.getState();

        // For each event that has been received
        for (var i = 0; i < events.length; i++)
        {
            // get the event
            const element = events[i];

            // Ensure we are processing a state changed event
            if (element['name'] === 'DeviceStateChangedEvent')
            {
                // If the URL matches the it is for this device
                if ((element['deviceURL'] === myURL) && element['deviceStates'])
                {
                    // Got what we need to update the device so lets process each capability
                    for (var x = 0; x < element.deviceStates.length; x++)
                    {
                        // Get the Somfy capability
                        const deviceState = element.deviceStates[x];

                        // look up the entry so we can get the Homey capability, etc
                        const found = Capabilities.find(element => element.somfyNameGet === deviceState.name);

                        if (found)
                        {
                            // Yep we can relate to this one
                            Homey.app.logStates(this.getName() + ": " + found.somfyNameGet + "= " + deviceState.value);
                            const oldState = oldStates[found.homeyName];
                            const newState = (found.compare ? (deviceState.value === found.compare) : (deviceState.value));
                            if (oldState !== newState)
                            {
                                this.triggerCapabilityListener(found.homeyName, newState,
                                {
                                    fromCloudSync: true
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    async sync()
    {
        try
        {
            if (Homey.app.loggedIn)
            {
                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("Device initial sync.", this.getName());
                }

                const deviceURL = this.getDeviceUrl();
                if (deviceURL)
                {
                    return await Tahoma.getDeviceStates(deviceURL);
                }

                if (process.env.DEBUG === '1')
                {
                    const simData = Homey.ManagerSettings.get('simData');
                    if (simData)
                    {
                        const deviceOid = this.getData().id;
                        for (var i = 0; i < simData.length; i++)
                        {
                            if (simData[i].oid == deviceOid)
                            {
                                return simData[i].states;
                            }
                        }
                        return null;
                    }
                }
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