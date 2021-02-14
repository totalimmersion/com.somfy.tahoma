'use strict';

const Homey = require('homey');
const Tahoma = require('../../lib/Tahoma');

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    { homeyName: 'target_temperature.comfort_heating', somfyNameGet: 'core:ComfortRoomTemperatureState', somfyNameSet: 'setAllModeTemperatures', somfyArray: 0 },
    { homeyName: 'target_temperature.eco_heating', somfyNameGet: 'core:EcoTargetTemperatureState', somfyNameSet: 'setAllModeTemperatures', somfyArray: 1 },
    { homeyName: 'target_temperature.away', somfyNameGet: 'io:AwayModeTargetTemperatureState', somfyNameSet: 'setAllModeTemperatures', somfyArray: 2 },
    { homeyName: 'target_temperature.frost_protection', somfyNameGet: 'core:FrostProtectionRoomTemperatureState', somfyNameSet: 'setAllModeTemperatures', somfyArray: 3 },
    { homeyName: 'open_window_state', somfyNameGet: 'core:OpenWindowDetectionActivationState', somfyNameSet: '', compare: ['inactive', 'active'] },
    { homeyName: 'measure_battery', somfyNameGet: 'core:BatteryLevelState', somfyNameSet: '' },
    { homeyName: 'valve_heating_mode_state', somfyNameGet: 'io:CurrentHeatingModeState', somfyNameSet: '' },
    { homeyName: 'derogation_mode', somfyNameGet: 'io:DerogationHeatingModeState', somfyNameSet: 'setDerogation', somfyArray: 0 },
    { homeyName: 'derogation_type', somfyNameGet: 'io:DerogationTypeState', somfyNameSet: 'setDerogation', somfyArray: 1 },
    { homeyName: 'valve_state', somfyNameGet: 'core:OpenClosedValveState', somfyNameSet: 'setValveSettings', compare: ['closed', 'open'] }
];
class ValveHeatingDevice extends SensorDevice
{

    async onInit()
    {
        this.boostSync = true;
        await super.onInit(CapabilitiesXRef);
    }

    async onCapability(capabilityXRef, value, opts)
    {
        if (!opts || !opts.fromCloudSync)
        {
            if (typeof(capabilityXRef.somfyArray) === "undefined")
            {
                // Let the base class handle the standard entries
                return super.onCapability(capabilityXRef, value, opts);
            }

            if (this.boostSync)
            {
                await Homey.app.boostSync();
            }

            const applicableEntries = CapabilitiesXRef.filter(entry => entry.somfyNameSet === capabilityXRef.somfyNameSet).sort((a, b) => a.somfyArray - b.somfyArray);

            let somfyValues = [];
            for(const element of applicableEntries)
            {
                somfyValues.push(element.homeyName === capabilityXRef.homeyName ? value : this.getCapabilityValue(element.homeyName));
            };

            const deviceData = this.getData();
            if (this.executionId !== null)
            {
                await Tahoma.cancelExecution(this.executionId);
            }

            var action = {
                name: capabilityXRef.somfyNameSet,
                parameters: somfyValues
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
            // Let the base class handle the standard entries
            return super.onCapability(capabilityXRef, value, opts);
        }
    }

    // Update the capabilities
    async syncEvents(events)
    {
        this.syncEventsList(events, CapabilitiesXRef);
    }
}

module.exports = ValveHeatingDevice;