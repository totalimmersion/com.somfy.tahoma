'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticPassAPCZoneControlMainComponent controllable name in TaHoma
 * @extends {Driver}
 */
class AtlanticZoneControllerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ['io:AtlanticPassAPCZoneControlMainComponent'];

        this.setEcoTemperatureAction = new Homey.FlowCardAction("absence_heating_temperature_set");
        this.setEcoTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("absence_heating_temperature_set");
                await args.device.onCapabilityTargetTemperatureEco(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.absence_cooling", args.target_temperature);
            });

        this.setComfortTemperatureAction = new Homey.FlowCardAction("absence_heating_temperature_set");
        this.setComfortTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("absence_heating_temperature_set");
                await args.device.onCapabilityTargetTemperatureComfort(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.absence_heating", args.target_temperature);
            });

        this.setBoilerModeAction = new Homey.FlowCardAction("cancel_absence_set");
        this.setBoilerModeAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("cancel_absence_set");
                await args.device.onCapabilityBoilerMode(args.state, null);
            });

        this.setBoostAction = new Homey.FlowCardAction("set_auto_heat_cool");
        this.setBoostAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_auto_heat_cool");
                await args.device.onCapabilityBoostState(args.state, null);
                return args.device.setCapabilityValue("heating_cooling_auto_switch", args.state);
            });

        this.setBoostAction = new Homey.FlowCardAction("set_pac_operating_mode");
        this.setBoostAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_pac_operating_mode");
                await args.device.onCapabilityBoostState(args.state, null);
                return args.device.setCapabilityValue("pass_apc_operating_mode", args.state);
            });
    }

}

module.exports = AtlanticZoneControllerDriver;