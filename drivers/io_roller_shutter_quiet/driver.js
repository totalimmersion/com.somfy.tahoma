/*jslint node: true */
"use strict";

const Homey = require('homey');
const ioWindowCoveringsDriver = require("../ioWindowCoveringsDriver");

/**
 * Driver class for roller shutters with the io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class RollerShutterQuietDriver extends ioWindowCoveringsDriver
{
    async onInit()
    {
        this.deviceType = ["io:RollerShutterWithLowSpeedManagementIOComponent"];

        this.setQuietModeAction = new Homey.FlowCardAction("set_quiet_mode");
        this.setQuietModeAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_quiet_mode");
                await args.device.onCapabilityQuietMode(args.newQuietMode == "on", null);
                return args.device.setCapabilityValue("quiet_mode", args.newQuietMode == "on");
            })

        this.set_my_position = new Homey.FlowCardAction('set_my_position');
        this.set_my_position
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_my_position");
                return args.device.onCapabilityMyPosition(true, null);
            })

        await super.onInit();
    }
}

module.exports = RollerShutterQuietDriver;