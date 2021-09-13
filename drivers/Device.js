/*jslint node: true */
'use strict';
const Homey = require('homey');
const Tahoma = require('./../lib/Tahoma');
/**
 * Base class for devices
 * @extends {Homey.Device}
 */
class Device extends Homey.Device
{
    async onInit(CapabilitiesXRef)
    {
        this.boostSync = false;
        this.executionId = null;
        this.executionCmd = "";

        this.executionCommands = [];

        if (CapabilitiesXRef)
        {
            CapabilitiesXRef.forEach(element =>
            {
                this.registerCapabilityListener(element.homeyName, this.onCapability.bind(this, element));
            });

            this.syncEventsList(null, CapabilitiesXRef);
        }
        this.log('Device init:', this.getName(), 'class:', this.getClass());
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
     * Some devices use multiple URL's that have an index on the end
     * E.g. device#1, device#2, etc
     * Therefore hashIndex specifies the index where 0 is the url without the #1, 1 is the recorded url and 2 onwards specifies the extra urls
     * @return {String}
     * If hashIndex > 0 and there is no #1 at the end of the recorded url then return is null
     */
    getDeviceUrl(hashIndex)
    {
        if ((hashIndex === undefined) || (hashIndex === 1))
        {
            // Return the original url
            return this.getData().deviceURL;
        }

        let subUrl = this.getData().deviceURL.split('#');
        if (hashIndex === 0)
        {
            // Return the original url without the #1
            return subUrl[0];
        }

        if (subUrl.length < 2)
        {
            // There was no # so return null
            return null;
        }

        // Return the url with the new bub # number
        subUrl = subUrl[0] + '#' + hashIndex.toString();
        return subUrl;
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
            if (this.boostSync)
            {
                await Homey.app.boostSync();
            }

            let somfyValue = value;
            if (value === null)
            {
                somfyValue = opts;
            }
            else
            {
                if (capabilityXRef.parameters != undefined)
                {
                    if (capabilityXRef.parameters.length > 1)
                    {
                        somfyValue = capabilityXRef.parameters[(value ? 1 : 0)];
                    }
                    else
                    {
                        somfyValue = capabilityXRef.parameters;
                    }
                }
                else if (capabilityXRef.scale)
                {
                    somfyValue *= capabilityXRef.scale;
                }
                else if (capabilityXRef.compare)
                {
                    somfyValue = capabilityXRef.compare[(value === false ? 0 : 1)];
                }

                if (capabilityXRef.parameterArray != undefined)
                {
                    somfyValue = capabilityXRef.parameterArray;
                }
                else
                {
                    somfyValue = somfyValue == '' ? [] : [somfyValue];
                }
            }

            const deviceData = this.getData();
            let idx = this.executionCommands.findIndex(element => capabilityXRef.somfyNameSet.indexOf(element.name) >= 0);
            if (idx >= 0)
            {
                try
                {
                    await Tahoma.cancelExecution(this.executionCommands[idx].id);
                }
                catch(err)
                {
                    Homey.app.logInformation(this.getName(),
                    {
                        message: err.message,
                        stack: err.stack
                    });
                }
                this.executionCommands.splice(idx, 1);
            }

            let cmdIdx = 0;
            if (capabilityXRef.somfyNameSet.length > 1)
            {
                cmdIdx = (value ? 1 : 0);
            }

            var action = {
                name: capabilityXRef.somfyNameSet[cmdIdx],
                parameters: somfyValue
            };

            var action2;
            if (capabilityXRef.secondaryCommand && capabilityXRef.secondaryCommand[somfyValue])
            {
                action2 = capabilityXRef.secondaryCommand[somfyValue];
            }

            let result = await Tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action, action2);
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
                    let idx = this.executionCommands.findIndex(element => capabilityXRef.somfyNameSet.indexOf(element.name) >= 0);
                    if (idx < 0)
                    {
                        this.executionCommands.push({ id: result.execId, name: action.name });
                    }
                    else
                    {
                        await Homey.app.unBoostSync();
                    }
                }
            }
            else
            {
                Homey.app.logInformation(this.getName() + ": onCapability " + capabilityXRef.somfyNameSet[cmdIdx], "Failed to send command");
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
                let oldValue = this.getCapabilityValue(capabilityXRef.homeyName);

                await this.setCapabilityValue(capabilityXRef.homeyName, value);

                // For boolean states, setup a safety timeout incase the off state is not received.
                if (typeof value === 'boolean')
                {
                    if (value && (value != oldValue))
                    {
                        this.checkTimerID = setTimeout(() =>
                        {
                            this.syncEvents(null);
                        }, 60000);
                    }
                    else
                    {
                        clearTimeout(this.checkTimerID);
                    }
                }

                if (this.getDriver().triggerFlows)
                {
                    //trigger flows
                    this.getDriver().triggerFlows(this, capabilityXRef.homeyName, value);

                }
            }
            catch (err)
            {
                Homey.app.logInformation(this.getName() + ": onCapability " + capabilityXRef.homeyName, err);
            }
        }
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     * Capabilities{somfyNameGet: 'name of the Somfy capability, homeyName: 'name of the Homey capability', compare:[] 'text array for false and true value or not specified if real value' }
     */
    async syncList(CapabilitiesXRef)
    {
        try
        {
            const states = await this.getStates();
            if (states)
            {
                // Look for each of the required capabilities
                for (const capability of CapabilitiesXRef)
                {
                    try
                    {
                        let state = states.find(state => state.name === capability.somfyNameGet);
                        if (state)
                        {
                            if (typeof state.value === 'string')
                            {
                                state.value = state.value.toLowerCase();
                            }

                            // Check if Somfy is returning an alternative state name
                            if (capability.conversions && capability.conversions[state.value])
                            {
                                // Yep, so convert to the published one
                                state.value = capability.conversions[state.value];
                            }

                            // Found the entry
                            Homey.app.logStates(this.getName() + ": " + capability.somfyNameGet + "= " + state.value);
                            await this.triggerCapabilityListener(capability.homeyName, (capability.compare ? (state.value === capability.compare[1]) : (capability.scale ? state.value / capability.scale : state.value)), { fromCloudSync: true });
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
    async syncEventsList(events, CapabilitiesXRef)
    {
        if (events === null)
        {
            // No events so synchronise all capabilities
            return this.syncList(CapabilitiesXRef);
        }

        // get the url without the #1 on the end
        const myURL = this.getDeviceUrl(0);
        const oldStates = this.getState();

        // Process events sequentially so they are in the correct order
        // For each event that has been received
        for (var i = 0; i < events.length; i++)
        {
            // get the event
            const element = events[i];

            // Ensure we are processing a state changed event
            if (element.name === 'DeviceStateChangedEvent')
            {
                // If the URL matches the it is for this device
                if (element.deviceStates && (element.deviceURL.startsWith(myURL)))
                {
                    if (Homey.app.infoLogEnabled)
                    {
                        Homey.app.logInformation(this.getName(),
                        {
                            message: "Processing device state change event",
                            stack: element
                        });
                    }
                    // Got what we need to update the device so lets process each capability
                    for (var x = 0; x < element.deviceStates.length; x++)
                    {
                        // Get the Somfy capability
                        const deviceState = element.deviceStates[x];

                        // look up the entry so we can get the Homey capability, etc
                        const found = CapabilitiesXRef.find(element => element.somfyNameGet === deviceState.name);

                        if (found)
                        {
                            // Yep we can relate to this one
                            let deviceValue = '';
                            if (deviceState.value)
                            {
                                deviceValue = deviceState.value;
                            }
                            Homey.app.logStates(this.getName() + ": " + found.somfyNameGet + "= " + deviceValue);
                            const oldState = oldStates[found.homeyName];
                            let newState = (found.compare ? (deviceValue === found.compare[1]) : (deviceValue));

                            if (typeof oldState === 'number')
                            {
                                newState = Number(newState);
                            }
                            else if (typeof oldState === 'string')
                            {
                                newState = newState.toLowerCase();
                            }

                            if (oldState !== newState)
                            {
                                if (found.conversions && found.conversions[newState])
                                {
                                    newState = found.conversions[newState];
                                }

                                if (Homey.app.infoLogEnabled)
                                {
                                    Homey.app.logInformation(this.getName(),
                                    {
                                        message: "Setting new state",
                                        stack: {capability: found.homeyName, state: newState}
                                    });
                                }
                                this.triggerCapabilityListener(found.homeyName, newState, { fromCloudSync: true });
                            }
                            else
                            {
                                if (Homey.app.infoLogEnabled)
                                {
                                    Homey.app.logInformation(this.getName(),
                                    {
                                        message: "Same as existing state",
                                        stack:  {capability: found.homeyName, state: newState}
                                    });
                                }
                            }
                        }
                    }
                }
            }
            else if (element.name === 'ExecutionRegisteredEvent')
            {
                for (let x = 0; x < element.actions.length; x++)
                {
                    if ((myURL === element.actions[x].deviceURL))
                    {
                        let idx = this.executionCommands.findIndex(element2 => element2.name === element.actions[x].commands[0].name);
                        if (idx < 0)
                        {
                            this.executionCommands.push({ id: element.execId, name: element.actions[x].commands[0].name });
                            if (this.boostSync)
                            {
                                await Homey.app.boostSync();
                            }
                        }
                    }
                }
            }
            else if (element.name === 'ExecutionStateChangedEvent')
            {
                if ((element.newState === 'COMPLETED') || (element.newState === 'FAILED'))
                {
                    let idx = this.executionCommands.findIndex(element2 => element2.id === element.execId);
                    if (idx >= 0)
                    {
                        await Homey.app.unBoostSync();
                        this.executionCommands.splice(idx, 1);

                        Homey.app.triggerCommandComplete(this, this.executionCmd, (element.newState === 'COMPLETED'));
                        this.getDriver().triggerDeviceCommandComplete(this, this.executionCmd, (element.newState === 'COMPLETED'));
                        this.commandExecuting = '';

                        if (element.newState === 'COMPLETED')
                        {
                            this.setWarning(null);
                        }
                        else
                        {
                            this.setWarning('Command failed');
                        }
                    }
                }
                else if (element.newState === 'QUEUED_GATEWAY_SIDE')
                {
                    let idx = this.executionCommands.findIndex(element2 => element2.id === element.execId);
                    if (idx >= 0)
                    {
                        this.setWarning('Command queued wait for device to respond');
                    }
                }
            }
        }
    }

    // Get all the states for this device from Tahoma
    async getStates()
    {
        try
        {
            if (Homey.app.loggedIn)
            {
                if (Homey.app.infoLogEnabled)
                {
                    Homey.app.logInformation("Device initial sync.", this.getName());
                }

                // Get the recorded url (might include a #1 on the end)
                const deviceURL = this.getDeviceUrl(1);
                if (deviceURL)
                {
                    let states = await Tahoma.getDeviceStates(deviceURL);

                    // Get the next sub url if the original url ended with #1
                    let url2 = this.getDeviceUrl(2);
                    if (url2)
                    {
                        // We have a sub url to check
                        let states2 = await Tahoma.getDeviceStates(url2);
                        states = states.concat( states2);
                    }
                    return states;
                }

                if (Homey.ManagerSettings.get('debugMode'))
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
        return null;
    }

    checkForDuplicatesEvents(events, startElement, startState, myURL, stateName)
    {
        for (var i = startElement; i < events.length; i++)
        {
            const element = events[i];
            if ((element.name === 'DeviceStateChangedEvent') && (element.deviceURL === myURL) && element.deviceStates)
            {
                for (var x = startState; x < element.deviceStates.length; x++)
                {
                    const deviceState = element.deviceStates[x];
                    if (deviceState.name === stateName)
                    {
                        // Found a duplicate
                        if (Homey.app.infoLogEnabled)
                        {
                            Homey.app.logInformation(this.getName(),
                            {
                                message: "Ignoring duplicate event",
                                stack: deviceState
                            });
                        }
                        return true;
                    }
                }
                startState = 0;
            }
        }

        return false;
    }
}
module.exports = Device;