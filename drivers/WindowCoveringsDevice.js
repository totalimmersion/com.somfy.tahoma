/* jslint node: true */

'use strict';

const Device = require('./Device');

/**
 * Base class for window coverings devices
 * @extends {Device}
 */
class WindowCoveringsDevice extends Device
{

    async onInit()
    {
        if (this.hasCapability('lock_state'))
        {
            this.driver.lock_state_changedTrigger = this.homey.flow.getDeviceTriggerCard('lock_state_changed');
        }

        this.invertPosition = this.getSetting('invertPosition');
        if (this.invertPosition === null)
        {
            this.invertPosition = false;
        }

        this.invertTile = this.getSetting('invertTile');
        if (this.invertTile === null)
        {
            this.invertTile = false;
        }

        this.invertUpDown = this.getSetting('invertUpDown');
        if (this.invertUpDown === null)
        {
            this.invertUpDown = false;
        }

        if (this.invertUpDown)
        {
            // Homey capability to Somfy command map
            this.windowcoveringsActions = {
                up: 'close',
                idle: 'stop',
                down: 'open',
            };

            // Somfy state to Homey capability map
            this.windowcoveringsStatesMap = {
                open: 'down',
                closed: 'up',
                unknown: 'idle',
            };
        }
        else
        {
            this.windowcoveringsActions = {
                up: 'open',
                idle: 'stop',
                down: 'close',
            };

            this.windowcoveringsStatesMap = {
                open: 'up',
                closed: 'down',
                unknown: 'idle',
            };
        }

        this.positionStateName = 'core:ClosureState'; // Name of state to get the current position
        this.setPositionActionName = 'setClosure'; // Name of the command to set the current position
        this.openClosedStateName = 'core:OpenClosedState'; // Name of the state to get open / closed state
        this.myCommand = 'my'; // Name of the command to set the My position

        this.quietMode = false;
        this.boostSync = true;

        this.registerCapabilityListener('windowcoverings_state', this.onCapabilityWindowcoveringsState.bind(this));
        this.registerCapabilityListener('windowcoverings_state.rts', this.onCapabilityWindowcoveringsState.bind(this));
        this.registerCapabilityListener('windowcoverings_set', this.onCapabilityWindowcoveringsSet.bind(this));
        this.registerCapabilityListener('windowcoverings_tilt_up', this.onCapabilityWindowcoveringsTiltUp.bind(this));
        this.registerCapabilityListener('windowcoverings_tilt_down', this.onCapabilityWindowcoveringsTiltDown.bind(this));
        this.registerCapabilityListener('my_position', this.onCapabilityMyPosition.bind(this));
        this.registerCapabilityListener('quick_open', this.onCapabilityWindowcoveringsClosed.bind(this));
        this.registerCapabilityListener('windowcoverings_tilt_set', this.onCapabilityWindowcoveringsTiltSet.bind(this));

        await super.onInit();
    }

    onAdded()
    {
        this.log('device added');
        this.sync();
    }

    async onSettings({ oldSettings, newSettings, changedKeys })
    {
        if (changedKeys.indexOf('invertUpDown') >= 0)
        {
            this.invertUpDown = newSettings.invertUpDown;

            if (this.invertUpDown)
            {
                this.windowcoveringsActions = {
                    up: 'close',
                    idle: 'stop',
                    down: 'open',
                };

                this.windowcoveringsStatesMap = {
                    open: 'down',
                    closed: 'up',
                    unknown: 'idle',
                };
            }
            else
            {
                this.windowcoveringsActions = {
                    up: 'open',
                    idle: 'stop',
                    down: 'close',
                };

                this.windowcoveringsStatesMap = {
                    open: 'up',
                    closed: 'down',
                    unknown: 'idle',
                };
            }
        }

        if (changedKeys.indexOf('invertTile') >= 0)
        {
            this.invertTile = newSettings.invertTile;
        }

        if (changedKeys.indexOf('invertPosition') >= 0)
        {
            this.invertPosition = newSettings.invertPosition;
        }
    }

    async onCapabilityWindowcoveringsState(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.windowcoveringsActions[value] === null)
            {
                // Action is not supported
                this.homey.app.logInformation(`${this.getName()}: onCapabilityWindowcoveringsState`, 'option not supported');
                return;
            }

            if (this.boostSync)
            {
                await this.homey.app.boostSync();
            }

            const deviceData = this.getData();

            if (value === 'idle' && (this.executionId !== null))
            {
                await this.homey.app.tahoma.cancelExecution(this.executionId);
                this.executionCmd = '';
                this.executionId = null;
            }
            else
            {
                if (this.executionId !== null)
                {
                    await this.homey.app.tahoma.cancelExecution(this.executionId);
                    this.executionCmd = '';
                    this.executionId = null;
                }

                const action = {
                    name: this.windowcoveringsActions[value],
                    parameters: [],
                };
                const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
                if (result)
                {
                    if (result.errorCode)
                    {
                        this.setWarning(result.errorCode + result.error).catch(this.error);
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
                        this.executionCmd = action.name;
                        this.executionId = result.execId;
                    }
                }
                else
                {
                    this.homey.app.logInformation(`${this.getName()}: onCapabilityWindowcoveringsState`, 'Failed to send command');
                    if (this.boostSync)
                    {
                        await this.homey.app.unBoostSync();
                    }
                    throw (new Error('Failed to send command'));
                }
            }

            if (!this.openClosedStateName)
            {
                this.homey.setTimeout(() =>
                {
                    this.setCapabilityValue('windowcoverings_state.rts', null).catch(this.error);
                }, 500);
            }
        }
        else
        {
            // New value from Tahoma
            this.setCapabilityValue('windowcoverings_state', value).catch(this.error);
            if (this.hasCapability('quick_open'))
            {
                if (this.invertTile)
                {
                    this.setCapabilityValue('quick_open', value !== 'up').catch(this.error);
                }
                else
                {
                    this.setCapabilityValue('quick_open', value !== 'down').catch(this.error);
                }
            }
        }
    }

    async onCapabilityWindowcoveringsSet(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.boostSync)
            {
                await this.homey.app.boostSync();
            }

            const deviceData = this.getData();

            if (this.executionId !== null)
            {
                await this.homey.app.tahoma.cancelExecution(this.executionId);
                this.executionCmd = '';
                this.executionId = null;
            }

            if (this.invertPosition)
            {
                value = 1 - value;
            }
            const action = {
                name: this.setPositionActionName, // Anders pull request
                parameters: [Math.round((1 - value) * 100)],
            };

            if (this.setPositionActionName === 'setPositionAndLinearSpeed')
            {
                // Add low speed option if quiet mode is selected
                action.parameters.push('lowspeed');
            }

            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result)
            {
                if (result.errorCode)
                {
                    this.setWarning(result.errorCode + result.error).catch(this.error);
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
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityWindowcoveringsSet`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            // New value from Tahoma
            this.setCapabilityValue('windowcoverings_set', value).catch(this.error);
        }
    }

    async onCapabilityWindowcoveringsTiltSet(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.boostSync)
            {
                await this.homey.app.boostSync();
            }

            const deviceData = this.getData();
            if (this.executionId !== null)
            {
                await this.homey.app.tahoma.cancelExecution(this.executionId);
                this.executionCmd = '';
                this.executionId = null;
            }

            const action = {
                name: 'setOrientation',
                parameters: [Math.round((1 - value) * 100)],
            };

            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result)
            {
                if (result.errorCode)
                {
                    this.setWarning(result.errorCode + result.error).catch(this.error);
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
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityWindowcoveringsTiltSet`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            // New value from Tahoma
            this.setCapabilityValue('windowcoverings_tilt_set', value).catch(this.error);

            // trigger flows
            const tokens = {
                windowcoverings_tilt: value,
            };
            this.driver.triggerTiltChange(this, tokens);
        }
    }

    async onCapabilityWindowcoveringsTiltUp(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.boostSync)
            {
                await this.homey.app.boostSync();
            }

            const deviceData = this.getData();
            if (this.executionId !== null)
            {
                await this.homey.app.tahoma.cancelExecution(this.executionId);
                this.executionCmd = '';
                this.executionId = null;
            }

            const action = {
                name: 'tiltPositive',
                parameters: [3, 1],
            };
            const result = await this.homey.app.tahoma.executeDeviceAction(deviceData.label, deviceData.deviceURL, action);
            if (result)
            {
                if (result.errorCode)
                {
                    this.setWarning(result.errorCode + result.error).catch(this.error);
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
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityWindowcoveringsTiltUp`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
    }

    async onCapabilityWindowcoveringsTiltDown(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (this.boostSync)
            {
                await this.homey.app.boostSync();
            }

            const deviceData = this.getData();
            if (this.executionId !== null)
            {
                await this.homey.app.tahoma.cancelExecution(this.executionId);
                this.executionCmd = '';
                this.executionId = null;
            }

            const action = {
                name: 'tiltNegative',
                parameters: [3, 1],
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
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityWindowcoveringsTiltDown`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
    }

    async onCapabilityMyPosition(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
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

            const action = {
                name: this.myCommand,
                parameters: [],
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
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityMyPosition`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
    }

    async onCapabilityPedestrian(value, opts)
    {
        if (!opts || !opts.fromCloudSync)
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

            const action = {
                name: 'setPedestrianPosition',
                parameters: [],
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
                    this.executionCmd = action.name;
                    this.executionId = result.execId;
                }
            }
            else
            {
                this.homey.app.logInformation(`${this.getName()}: onCapabilityPedestrian`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            // New value from Tahoma
            this.setCapabilityValue('pedestrian', value).catch(this.error);

            // trigger flows
            const tokens = {
                pedestrian: value,
            };
            this.driver.triggerPedestrianChange(this, tokens);
        }
    }

    async onCapabilityWindowcoveringsClosed(value, opts)
    {
        if (this.invertTile)
        {
            return this.onCapabilityWindowcoveringsState(value ? 'down' : 'up', null);
        }

            return this.onCapabilityWindowcoveringsState(value ? 'up' : 'down', null);
    }

    /**
     * Sync the state of the devices from the TaHoma cloud with Homey
     */
    async sync()
    {
        try
        {
            const states = await super.getStates();
            if (states)
            {
                if (this.hasCapability('lock_state'))
                {
                    const lockState = states.find(state => (state && (state.name === 'io:PriorityLockOriginatorState')));
                    if (lockState)
                    {
                        this.homey.app.logStates(`${this.getName()}: io:PriorityLockOriginatorState = ${lockState.value}`);
                        this.setCapabilityValue('lock_state', lockState.value).catch(this.error);

                        if (this.checkLockSate)
                        {
                            clearTimeout(this.checkLockStateTimer);
                            this.checkLockStateTimer = this.homey.setTimeout(this.checkLockSate, 60 * 1000);
                        }
                    }
                    else
                    {
                        const lockStateTimer = states.find(state => (state && (state.name === 'core:PriorityLockTimerState')));
                        if (lockStateTimer)
                        {
                            this.homey.app.logStates(`${this.getName()}: core:PriorityLockTimerState = ${lockStateTimer.value}`);
                            if (lockStateTimer.value === 0)
                            {
                                this.setCapabilityValue('lock_state', '').catch(this.error);
                            }
                        }
                    }
                }

                const myPosition = states.find(state => (state && (state.name === 'core:Memorized1PositionState')));
                if (myPosition)
                {
                    if (!this.hasCapability('my_value'))
                    {
                        this.addCapability('my_value').catch(this.error);
                    }

                    this.homey.app.logStates(`${this.getName()}: core:Memorized1PositionState = ${myPosition.value}`);
                    this.setCapabilityValue('my_value', myPosition.value).catch(this.error);
                }

                // device exists -> let's sync the state of the device
                const closureState = states.find(state => (state && (state.name === this.positionStateName)));
                const openClosedState = states.find(state => (state && (state.name === this.openClosedStateName)));
                const tiltState = states.find(state => (state && (state.name === 'core:SlateOrientationState')));

                if (this.unavailable)
                {
                    this.unavailable = false;
                    this.setAvailable().catch(this.error);
                }

                if (openClosedState)
                {
                    this.homey.app.logStates(`${this.getName()}: ${this.openClosedStateName} = ${openClosedState.value}`);

                    // Convert Tahoma states to Homey equivalent
                    if (closureState && (closureState.value !== 0) && (closureState.value !== 100))
                    {
                        // Not fully open or closed
                        openClosedState.value = 'idle';
                    }
                    else
                    {
                        if (this.openClosedStateName === 'core:OpenClosedPedestrianState')
                        {
                            // Special state = My Position
                            this.triggerCapabilityListener('pedestrian', (openClosedState.value === 'pedestrian'),
                            {
                                fromCloudSync: true,
                            }).catch(this.error);
                        }

                        openClosedState.value = this.windowcoveringsStatesMap[openClosedState.value];
                    }

                    this.triggerCapabilityListener('windowcoverings_state', openClosedState.value,
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                if (closureState)
                {
                    this.homey.app.logStates(`${this.getName()}: ${this.positionStateName} = ${closureState.value}`);

                    if (this.invertPosition)
                    {
                        closureState.value = 100 - closureState.value;
                    }
                    this.triggerCapabilityListener('windowcoverings_set', 1 - (closureState.value / 100),
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }

                if (tiltState)
                {
                    this.homey.app.logStates(`${this.getName()}: core:SlateOrientationState = ${tiltState.value}`);

                    this.triggerCapabilityListener('windowcoverings_tilt_set', 1 - (tiltState.value / 100),
                    {
                        fromCloudSync: true,
                    }).catch(this.error);
                }
            }
            else if (this.hasCapability('windowcoverings_state.rts'))
            {
                // RTS devices have no feedback
                if (this.unavailable)
                {
                    this.unavailable = false;
                    this.setAvailable().catch(this.error);
                }

                this.log(this.getName(), ' No device status');

                this.setCapabilityValue('windowcoverings_state.rts', null).catch(this.error);
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

    /**
     * Sync the state of the devices from the TaHoma cloud with Homey
     */
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

            let lastPosition = null;

            // Process events sequentially so they are in the correct order
            for (let i = 0; i < events.length; i++)
            {
                const element = events[i];
                if (element.name === 'DeviceStateChangedEvent')
                {
                    if ((element.deviceURL === myURL) && element.deviceStates)
                    {
                        if (this.homey.app.infoLogEnabled)
                        {
                            this.homey.app.logInformation(this.getName(),
                            {
                                message: 'Processing device state change event',
                                stack: element,
                            });
                        }

                        // Got what we need to update the device so lets find it
                        if (this.unavailable)
                        {
                            this.unavailable = false;
                            this.setAvailable().catch(this.error);
                        }

                        for (let x = 0; x < element.deviceStates.length; x++)
                        {
                            const deviceState = element.deviceStates[x];

                            // Device lock state
                            if (deviceState.name === 'io:PriorityLockOriginatorState')
                            {
                                if (this.hasCapability('lock_state') && (deviceState.value))
                                {
                                    this.homey.app.logStates(`${this.getName()}: io:PriorityLockOriginatorState = ${deviceState.value}`);
                                    this.setCapabilityValue('lock_state', deviceState.value).catch(this.error);
                                    if (this.checkLockSate)
                                    {
                                        // Setup timer to call a function to check if it can be cleared
                                        clearTimeout(this.checkLockStateTimer);
                                        this.checkLockStateTimer = this.homey.setTimeout(this.checkLockSate, (60 * 1000));
                                    }
                                }
                            }
                            else if (deviceState.name === this.positionStateName)
                            {
                                // Check for more message that are the same
                                if (!this.checkForDuplicatesEvents(events, i, x + 1, myURL, this.positionStateName))
                                {
                                    // Device position
                                    let closureStateValue = parseInt(deviceState.value, 10);
                                    this.homey.app.logStates(`${this.getName()}: ${this.positionStateName} = ${closureStateValue}`);

                                    if (this.invertPosition)
                                    {
                                        closureStateValue = 100 - closureStateValue;
                                    }

                                    this.triggerCapabilityListener('windowcoverings_set', 1 - (closureStateValue / 100),
                                    {
                                        fromCloudSync: true,
                                    }).catch(this.error);

                                    if ((closureStateValue !== 0) && (closureStateValue !== 100))
                                    {
                                        // Not fully open or closed
                                        this.triggerCapabilityListener('windowcoverings_state', 'idle',
                                        {
                                            fromCloudSync: true,
                                        }).catch(this.error);

                                        lastPosition = closureStateValue;
                                    }
                                    else
                                    {
                                        lastPosition = null;
                                    }
                                }
                            }
                            else if (deviceState.name === this.openClosedStateName)
                            {
                                // Check for more message that are the same
                                if (!this.checkForDuplicatesEvents(events, i, x + 1, myURL, this.openClosedStateName))
                                {
                                    // Device Open / Closed state. Only process if the last position was 0 or 100
                                    if (lastPosition === null)
                                    {
                                        let openClosedStateValue = deviceState.value;
                                        this.homey.app.logStates(`${this.getName()}: ${this.openClosedStateName} = ${openClosedStateValue}`);

                                        // Convert Tahoma states to Homey equivalent
                                        openClosedStateValue = this.windowcoveringsStatesMap[openClosedStateValue];

                                        this.triggerCapabilityListener('windowcoverings_state', openClosedStateValue,
                                        {
                                            fromCloudSync: true,
                                        }).catch(this.error);
                                    }

                                    lastPosition = null;
                                }
                            }
                            else if (deviceState.name === 'core:SlateOrientationState')
                            {
                                // Device tilt position
                                // Check for more message that are the same
                                if (!this.checkForDuplicatesEvents(events, i, x + 1, myURL, 'core:SlateOrientationState'))
                                {
                                    const tiltStateValue = parseInt(deviceState.value, 10);
                                    this.homey.app.logStates(`${this.getName()}: core:SlateOrientationState = ${tiltStateValue}`);

                                    this.triggerCapabilityListener('windowcoverings_tilt_set', 1 - (tiltStateValue / 100),
                                    {
                                        fromCloudSync: true,
                                    }).catch(this.error);
                                }
                            }
                        }
                    }
                }
                else if (element.name === 'ExecutionRegisteredEvent')
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

module.exports = WindowCoveringsDevice;
