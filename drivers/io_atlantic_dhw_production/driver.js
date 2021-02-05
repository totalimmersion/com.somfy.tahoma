'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticDomesticHotWaterProductionV2_AEX_IOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class WaterBoilerProductionDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ['io:AtlanticDomesticHotWaterProductionV2_AEX_IOComponent'];

        this.setEcoTemperatureAction = new Homey.FlowCardAction("eco_temperature_set");
        this.setEcoTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("eco_temperature_set");
                await args.device.onCapabilityTargetTemperatureEco(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.eco", args.target_temperature);
            });

        this.setComfortTemperatureAction = new Homey.FlowCardAction("comfort_temperature_set");
        this.setComfortTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("comfort_temperature_set");
                await args.device.onCapabilityTargetTemperatureComfort(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.comfort", args.target_temperature);
            });

        this.setBoilerModeAction = new Homey.FlowCardAction("boiler_mode_set");
        this.setBoilerModeAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("boiler_mode_set");
                await args.device.onCapabilityBoilerMode(args.state, null);
                return args.device.setCapabilityValue("boiler_mode", args.state);
            });

        this.setBoostAction = new Homey.FlowCardAction("boost_on_off");
        this.setBoostAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("boost_on_off");
                await args.device.onCapabilityBoostState(args.state, null);
                return args.device.setCapabilityValue("boost", args.state);
            });
    }

}

module.exports = WaterBoilerProductionDriver;