/* jslint node: true */

'use strict';

const Homey = require('homey');
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
        this.executionCmd = '';

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
        subUrl = `${subUrl[0]}#${hashIndex.toString()}`;
        return subUrl;
    }

    /**
     * Returns the io controllable name(s) of TaHoma
     * @return {Array} deviceType
     */
    getDeviceType()
    {
        return this.driver.getDeviceType();
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
                await this.homey.app.boostSync();
            }

            let somfyValue = value;
            if (value === null)
            {
                somfyValue = opts;
            }
            else
            {
                if (capabilityXRef.parameters !== undefined)
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

                if (capabilityXRef.parameterArray !== undefined)
                {
                    somfyValue = capabilityXRef.parameterArray;
                }
                else
                {
                    somfyValue = somfyValue === '' ? [] : [somfyValue];
                }
            }

            const deviceData = this.getData();
            const idx = this.executionCommands.findIndex(element => capabilityXRef.somfyNameSet.indexOf(element.name) >= 0);
            if (idx >= 0)
            {
                try
                {
                    await this.homey.app.tahoma.cancelExecution(this.executionCommands[idx].id);
                }
                catch (err)
                {
                    this.homey.app.logInformation(this.getName(),
                    {
                        message: err.message,
                        stack: err.stack,
                    });
                }
                this.executionCommands.splice(idx, 1);
            }

            let cmdIdx = 0;
            if (capabilityXRef.somfyNameSet.length > 1)
            {
                cmdIdx = (value ? 1 : 0);
            }

            if (typeof capabilityXRef.somfyNameSet[cmdIdx] === 'number')
            {
                // Set a different capability
                const otherCapabilityIdx = capabilityXRef.somfyNameSet[cmdIdx];
                const capabilityName = capabilityXRef.otherCapability[otherCapabilityIdx];
                value = this.getCapabilityValue(capabilityName);
                this.triggerCapabilityListener(capabilityName, value);
                return;
            }

            const action = {
                name: capabilityXRef.somfyNameSet[cmdIdx],
                parameters: somfyValue,
            };

            let action2;
            if (capabilityXRef.secondaryCommand && capabilityXRef.secondaryCommand[somfyValue])
            {
                action2 = capabilityXRef.secondaryCommand[somfyValue];
            }

            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action, action2);
            if (result !== undefined)
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
                    const idx = this.executionCommands.findIndex(element => capabilityXRef.somfyNameSet.indexOf(element.name) >= 0);
                    if (idx < 0)
                    {
                        this.executionCommands.push({ id: result.execId, name: action.name });
                    }
                    else
                    {
                        await this.homey.app.unBoostSync();
                    }
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapability ${capabilityXRef.somfyNameSet[cmdIdx]}`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            try
            {
                const oldValue = this.getCapabilityValue(capabilityXRef.homeyName);

                this.setCapabilityValue(capabilityXRef.homeyName, value).catch(this.error);

                // For boolean states, setup a safety timeout incase the off state is not received.
                if (typeof value === 'boolean')
                {
                    if (value && (value !== oldValue))
                    {
                        this.checkTimerID = this.homey.setTimeout(() =>
                        {
                            this.syncEvents(null);
                        }, 60000);
                    }
                    else
                    {
                        clearTimeout(this.checkTimerID);
                    }
                }

                if (this.driver.triggerFlows)
                {
                    // trigger flows
                    this.driver.triggerFlows(this, capabilityXRef.homeyName, value);
                }
            }
            catch (err)
            {
                this.homey.app.logInformation(`${this.getName()}: onCapability ${capabilityXRef.homeyName}`, err);
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
            // Get this devices states from Tahoma
            const tahomaStates = await this.getStates();
            if (tahomaStates)
            {
                // Look for each of the required capabilities
                for (const xRefEntry of CapabilitiesXRef)
                {
                    try
                    {
                        if (xRefEntry.somfyNameGet === 'core:OperatingModeState')
                        {
                            this.log('core:OperatingModeState');
                        }

                        // Find the tahoma device state for the table entry
                        const tahomaState = tahomaStates.find(state => state.name === xRefEntry.somfyNameGet);
                        if (tahomaState)
                        {
                            if (typeof tahomaState.value === 'string')
                            {
                                tahomaState.value = tahomaState.value.toLowerCase();
                            }

                            // Check if Somfy is returning an alternative state name
                            if (xRefEntry.conversions && xRefEntry.conversions[tahomaState.value])
                            {
                                // Yep, so convert to the published one
                                tahomaState.value = xRefEntry.conversions[tahomaState.value];
                            }

                            if (typeof tahomaState.value === 'string')
                            {
                                try
                                {
                                    // Find the translation for this capability with the Somfy enum id
                                    const translateName = `${xRefEntry.homeyName}.${tahomaState.value}`;
                                    const translatedState = Homey.__(translateName);
                                    if (translatedState !== translateName)
                                    {
                                        tahomaState.value = translatedState;
                                    }
                                }
                                catch (err)
                                {

                                }
                            }

                            // Found the entry
                            this.homey.app.logStates(`${this.getName()}: ${xRefEntry.somfyNameGet}= ${tahomaState.value}`);
                            await this.triggerCapabilityListener(xRefEntry.homeyName,
                                // eslint-disable-next-line no-nested-ternary
                                (xRefEntry.compare ? (tahomaState.value === xRefEntry.compare[1]) : (xRefEntry.scale ? (tahomaState.value / xRefEntry.scale) : tahomaState.value)),
                                { fromCloudSync: true });
                        }
                    }
                    catch (error)
                    {
                        this.homey.app.logInformation(this.getName(),
                        {
                            message: error.message,
                            stack: error.stack,
                        });
                    }
                }
            }
        }
        catch (error)
        {
            this.homey.app.logInformation(this.getName(),
            {
                message: error.message,
                stack: error.stack,
            });
        }
    }

    // look for updates in the events array
    async syncEventsList(events, CapabilitiesXRef)
    {
        if (events === null)
        {
            // No events so synchronise all capabilities
            this.syncList(CapabilitiesXRef);
            return;
        }

        // get the url without the #1 on the end
        const myURL = this.getDeviceUrl(0);

        // Get the capability values for this device
        const oldCapabilityStates = this.getState();

        // Process events sequentially so they are in the correct order
        // For each event that has been received
        for (const event of events)
        {
            // Ensure we are processing a state changed event
            if (event.name === 'DeviceStateChangedEvent')
            {
                // If the URL matches then it is for this device
                if (event.deviceStates && (event.deviceURL.startsWith(myURL)))
                {
                    if (this.homey.app.infoLogEnabled)
                    {
                        this.homey.app.logInformation(this.getName(),
                        {
                            message: 'Processing device state change event',
                            stack: event,
                        });
                    }
                    // Got what we need to update the device so lets process each capability
                    for (const tahomaState of event.deviceStates)
                    {
                        if (tahomaState.name === 'core:OperatingModeState')
                        {
                            this.log('core:OperatingModeState');
                        }

                        // look up the entry so we can get all the Homey capability, etc
                        for (const xRefEntry of CapabilitiesXRef)
                        {
                            if (xRefEntry.somfyNameGet === tahomaState.name)
                            {
                                // Yep we can relate to this one
                                let deviceValue = 'nodefect';
                                if (tahomaState.value)
                                {
                                    deviceValue = tahomaState.value;
                                }
                                else if (!xRefEntry.allowNull)
                                {
                                    if (this.homey.app.infoLogEnabled)
                                    {
                                        this.homey.app.logInformation(this.getName(),
                                        {
                                            message: 'State has no value',
                                            stack: { capability: xRefEntry.homeyName },
                                        });
                                    }

                                    continue;
                                }

                                // Check if Somfy is returning an alternative state name
                                if (xRefEntry.conversions && xRefEntry.conversions[tahomaState.value])
                                {
                                    // Yep, so convert to the published one
                                    tahomaState.value = xRefEntry.conversions[tahomaState.value];
                                }

                                this.homey.app.logStates(`${this.getName()}: ${xRefEntry.somfyNameGet}= ${deviceValue}`);
                                const oldState = oldCapabilityStates[xRefEntry.homeyName];
                                let newState = (xRefEntry.compare ? (deviceValue === xRefEntry.compare[1]) : (deviceValue));

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
                                    if (xRefEntry.conversions && xRefEntry.conversions[newState])
                                    {
                                        newState = xRefEntry.conversions[newState];
                                    }

                                    if (typeof newState === 'string')
                                    {
                                        try
                                        {
                                            // Find the translation for this capability with the Somfy enum id
                                            const translateName = `${xRefEntry.homeyName}.${newState}`;
                                            const translatedState = Homey.__(translateName);
                                            if (translatedState !== translateName)
                                            {
                                                newState = translatedState;
                                            }
                                            else if (newState === 'nodefect')
                                            {
                                                newState = '';
                                            }
                                        }
                                        catch (err)
                                        {

                                        }
                                    }

                                    if (this.homey.app.infoLogEnabled)
                                    {
                                        this.homey.app.logInformation(this.getName(),
                                        {
                                            message: 'Setting new state',
                                            stack: { capability: xRefEntry.homeyName, state: newState },
                                        });
                                    }
                                    this.triggerCapabilityListener(xRefEntry.homeyName, newState, { fromCloudSync: true });
                                }
                                else
                                if (this.homey.app.infoLogEnabled)
                                    {
                                        this.homey.app.logInformation(this.getName(),
                                        {
                                            message: 'Same as existing state',
                                            stack: { capability: xRefEntry.homeyName, state: newState },
                                        });
                                    }
                            }
                        }
                    }
                }
            }
            else if (event.name === 'ExecutionRegisteredEvent')
            {
//                for (let x = 0; x < event.actions.length; x++)
                for (const eventAction of event.actions)
                {
                    if (myURL === eventAction.deviceURL)
                    {
                        const idx = this.executionCommands.findIndex(element2 => element2.name === eventAction.commands[0].name);
                        if (idx < 0)
                        {
                            this.executionCommands.push({ id: event.execId, name: eventAction.commands[0].name });
                            if (this.boostSync)
                            {
                                await this.homey.app.boostSync();
                            }
                        }
                    }
                }
            }
            else if (event.name === 'ExecutionStateChangedEvent')
            {
                if ((event.newState === 'COMPLETED') || (event.newState === 'FAILED'))
                {
                    const idx = this.executionCommands.findIndex(element2 => element2.id === event.execId);
                    if (idx >= 0)
                    {
                        await this.homey.app.unBoostSync();
                        this.executionCommands.splice(idx, 1);

                        this.homey.app.triggerCommandComplete(this, this.executionCmd, (event.newState === 'COMPLETED'));
                        this.driver.triggerDeviceCommandComplete(this, this.executionCmd, (event.newState === 'COMPLETED'));
                        this.commandExecuting = '';

                        if (event.newState === 'COMPLETED')
                        {
                            this.setWarning(null).catch(this.error);
                        }
                        else
                        {
                            this.setWarning(Homey.__('command_failed')).catch(this.error);
                        }
                    }
                }
                else if (event.newState === 'QUEUED_GATEWAY_SIDE')
                {
                    const idx = this.executionCommands.findIndex(element2 => element2.id === event.execId);
                    if (idx >= 0)
                    {
                        this.setWarning(Homey.__('command_queued')).catch(this.error);
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
            if (this.homey.app.loggedIn)
            {
                if (this.homey.app.infoLogEnabled)
                {
                    this.homey.app.logInformation('Device initial sync.', this.getName());
                }

                // Get the recorded url (might include a #1 on the end)
                const deviceURL = this.getDeviceUrl(1);
                if (deviceURL)
                {
                    let states = await this.homey.app.tahoma.getDeviceStates(deviceURL);

                    // Get the next sub url if the original url ended with #1
                    const url2 = this.getDeviceUrl(2);
                    if (url2)
                    {
                        // We have a sub url to check
                        const states2 = await this.homey.app.tahoma.getDeviceStates(url2);
                        states = states.concat(states2);
                    }
                    return states;
                }

                if (this.homey.settings.get('debugMode'))
                {
                    const simData = this.homey.settings.get('simData');
                    if (simData)
                    {
                        const deviceOid = this.getData().id;
                        for (let i = 0; i < simData.length; i++)
                        {
                            if (simData[i].oid === deviceOid)
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
            this.homey.app.logInformation('Device initial sync.',
            {
                message: this.getName(),
                stack: error,
            });
        }
        return null;
    }

    checkForDuplicatesEvents(events, startElement, startState, myURL, stateName)
    {
        for (let i = startElement; i < events.length; i++)
        {
            const element = events[i];
            if ((element.name === 'DeviceStateChangedEvent') && (element.deviceURL === myURL) && element.deviceStates)
            {
                for (let x = startState; x < element.deviceStates.length; x++)
                {
                    const deviceState = element.deviceStates[x];
                    if (deviceState.name === stateName)
                    {
                        // Found a duplicate
                        if (this.homey.app.infoLogEnabled)
                        {
                            this.homey.app.logInformation(this.getName(),
                            {
                                message: 'Ignoring duplicate event',
                                stack: deviceState,
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
