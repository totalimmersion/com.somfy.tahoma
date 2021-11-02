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

        await super.onInit();
    }
}

module.exports = RollerShutterQuietDriver;
