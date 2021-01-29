'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticPassAPCHeatingAndCoolingZoneComponent, io:AtlanticPassAPCZoneControlZoneComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HotColdZoneDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ['io:AtlanticPassAPCHeatingAndCoolingZoneComponent', 'io:AtlanticPassAPCZoneControlZoneComponent'];

        this.setEcoCoolingTemperatureAction = new Homey.FlowCardAction("eco_cooling_temperature_set");
        this.setEcoCoolingTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("eco_cooling_temperature_set");
                await args.device.onCapabilityTargetTemperatureEcoCooling(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.eco_cooling", args.target_temperature);
            });

        this.setEcoHeatingTemperatureAction = new Homey.FlowCardAction("eco_heating_temperature_set");
        this.setEcoHeatingTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("eco_heating_temperature_set");
                await args.device.onCapabilityTargetTemperatureEcoHeating(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.eco_heating", args.target_temperature);
            });

        this.setComfortCoolingTemperatureAction = new Homey.FlowCardAction("comfort_cooling_temperature_set");
        this.setComfortCoolingTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("comfort_cooling_temperature_set");
                await args.device.onCapabilityTargetTemperatureComfortCooling(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.comfort_cooling", args.target_temperature);
            });

        this.setComfortHeatingTemperatureAction = new Homey.FlowCardAction("comfort_heating_temperature_set");
        this.setComfortHeatingTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("comfort_heating_temperature_set");
                await args.device.onCapabilityTargetTemperatureComfortHeating(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.comfort_heating", args.target_temperature);
            });

        this.setDerogationTemperatureAction = new Homey.FlowCardAction("derogation_temperature_set");
        this.setDerogationTemperatureAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("derogation_temperature_set");
                await args.device.onCapabilityTargetTemperatureDerogated(args.target_temperature, null);
                return args.device.setCapabilityValue("target_temperature.derogated", args.target_temperature);
            });

        this.setCoolingAction = new Homey.FlowCardAction("cooling_on_off");
        this.setCoolingAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("cooling_on_off");
                await args.device.onCapabilityOnOffCooling(args.state, null);
                return args.device.setCapabilityValue("boost.cooling", args.state === 'on');
            });

        this.setHeatingAction = new Homey.FlowCardAction("heating_on_off");
        this.setHeatingAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("heating_on_off");
                await args.device.onCapabilityOnOffHeating(args.state, null);
                return args.device.setCapabilityValue("boost.heating", args.state === 'on');
            });

        this.setDerogationAction = new Homey.FlowCardAction("derogation_on_off");
        this.setDerogationAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("derogation_on_off");
                await args.device.onCapabilityOnOffDerogated(args.state, null);
                return args.device.setCapabilityValue("boost.derogated", args.state === 'on');
            });

        this.setPassAPCCoolingModeAction = new Homey.FlowCardAction("cool_mode_set");
        this.setPassAPCCoolingModeAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("pass_apc_cooling_mode_set");
                await args.device.onCapabilityHeatCoolModeCool(args.state, null);
                return args.device.setCapabilityValue("heat_cool_mode.cool", args.state);
            });

        this.setPassAPCHeatingModeAction = new Homey.FlowCardAction("heat_mode_set");
        this.setPassAPCHeatingModeAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("pass_apc_heating_mode_set");
                await args.device.onCapabilityHeatCoolModeHeat(args.state, null);
                return args.device.setCapabilityValue("heat_cool_mode.heat", args.state);
            });
    }

}

module.exports = HotColdZoneDriver;