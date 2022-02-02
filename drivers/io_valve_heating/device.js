/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'measure_temperature',
        somfyNameGet: 'core:TemperatureState',
        somfyNameSet: [],
        somfyArray: 0,
    },
    {
        homeyName: 'target_temperature.comfort_heating',
        somfyNameGet: 'core:ComfortRoomTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 0,
    },
    {
        homeyName: 'target_temperature.eco_heating',
        somfyNameGet: 'core:EcoTargetTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 1,
    },
    {
        homeyName: 'target_temperature.away',
        somfyNameGet: 'io:AwayModeTargetTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 2,
    },
    {
        homeyName: 'target_temperature.frost_protection',
        somfyNameGet: 'core:FrostProtectionRoomTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 3,
    },
    {
        homeyName: 'open_window_activation',
        somfyNameGet: 'core:OpenWindowDetectionActivationState',
        somfyNameSet: ['setValveSettings'],
        compare: ['inactive', 'active'],
        parameters: [{ openWindow: false }, { openWindow: true }],
    },
    {
        homeyName: 'measure_battery',
        somfyNameGet: 'core:BatteryLevelState',
        somfyNameSet: [],
    },
    {
        homeyName: 'valve_heating_mode_state',
        somfyNameGet: 'io:CurrentHeatingModeState',
        somfyNameSet: [],
    },
    {
        homeyName: 'valve_operating_mode_state',
        somfyNameGet: 'core:OperatingModeState',
        somfyNameSet: [],
        conversions: { 'auto (schedule)': 'auto' },
    },
    {
        homeyName: 'valve_auto_mode',
        somfyNameGet: 'core:OperatingModeState',
        somfyNameSet: [0, 'exitDerogation'],
        conversions: { 'auto (schedule)': 'auto' },
        compare: ['inactive', 'auto'],
        parameters: [],
        otherCapability: ['derogation_mode'],
    },
    {
        homeyName: 'derogation_mode',
        somfyNameGet: 'io:DerogationHeatingModeState',
        somfyNameSet: ['setDerogation'],
        somfyArray: 0,
    },
    {
        homeyName: 'derogation_type',
        somfyNameGet: 'io:DerogationTypeState',
        somfyNameSet: ['setDerogation'],
        somfyArray: 1,
    },
    {
        homeyName: 'valve_state',
        somfyNameGet: 'core:OpenClosedValveState',
        somfyNameSet: [],
        compare: ['closed', 'open'],
    },
    {
        homeyName: 'defect_state',
        somfyNameGet: 'core:SensorDefectState',
        somfyNameSet: [],
        allowNull: true,
    },
    {
        homeyName: 'rssi',
        somfyNameGet: 'core:RSSILevelState',
        somfyNameSet: [],
    },
];
class ValveHeatingDevice extends SensorDevice
{

    async onInit()
    {
        await super.onInit(CapabilitiesXRef);
        this.boostSync = true;
    }

    async onCapability(capabilityXRef, value, opts)
    {
        if (this.infoLogEnabled)
        {
            this.homey.app.logInformation(this.getName(),
            {
                message: 'onCapability',
                stack: { capabilityXRef, value, opts },
            });
        }

        if (!opts || !opts.fromCloudSync)
        {
            if (typeof (capabilityXRef.somfyArray) === 'undefined')
            {
                // Let the base class handle the standard entries
                super.onCapability(capabilityXRef, value, opts);
                return;
            }

            if (this.boostSync)
            {
                if (!await this.homey.app.boostSync())
                {
                    throw (new Error('Failed to Boost Sync'));
                }
            }

            const applicableEntries = CapabilitiesXRef.filter(entry => entry.somfyNameSet[0] === capabilityXRef.somfyNameSet[0]).sort((a, b) => a.somfyArray - b.somfyArray);

            const somfyValues = [];
            for (const element of applicableEntries)
            {
                somfyValues.push(element.homeyName === capabilityXRef.homeyName ? value : this.getCapabilityValue(element.homeyName));
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

            const action = {
                name: capabilityXRef.somfyNameSet[0],
                parameters: somfyValues,
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
                this.homey.app.logInformation(`${this.getName()}: onCapability ${capabilityXRef.somfyNameSet[0]}`, 'Failed to send command');
                if (this.boostSync)
                {
                    await this.homey.app.unBoostSync();
                }
                throw (new Error('Failed to send command'));
            }
        }
        else
        {
            // Let the base class handle the standard entries
            super.onCapability(capabilityXRef, value, opts);
        }
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }

}

module.exports = ValveHeatingDevice;
