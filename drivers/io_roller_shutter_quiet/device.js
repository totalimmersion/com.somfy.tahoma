/*jslint node: true */
"use strict";

const WindowCoveringsDevice = require("../WindowCoveringsDevice");

/**
 * Device class for roller shutters with the io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDeviceQuiet extends WindowCoveringsDevice
{
    async onInit()
    {
        if (this.hasCapability("lock_state"))
        {
            this.removeCapability("lock_state");
        }

        await super.onInit();

        if (!this.hasCapability("my_position"))
        {
            this.addCapability("my_position");
        }

        if (!this.hasCapability("quick_open"))
        {
            this.addCapability("quick_open");
        }

        this.registerCapabilityListener("quiet_mode",
            this.onCapabilityQuietMode.bind(this)
        );

        this.quietMode = this.getCapabilityValue("quiet_mode");
        if (this.quietMode)
        {
            this.setPositionActionName = "setPositionAndLinearSpeed";
        }
        else
        {
            this.setPositionActionName = "setClosure";
        }
    }

    async onCapabilityQuietMode(value, opts)
    {
        this.quietMode = value;
        if (value)
        {
            this.setPositionActionName = "setPositionAndLinearSpeed";
        }
        else
        {
            this.setPositionActionName = "setClosure";
        }
    }

    async onCapabilityWindowcoveringsState(value, opts)
    {
        if ((!opts || !opts.fromCloudSync) &&
            this.setPositionActionName === "setPositionAndLinearSpeed" &&
            (value === "up" || value === "down")
        )
        {
            return super.onCapabilityWindowcoveringsSet(value === "up" ? 1 : 0, opts);
        }
        else
        {
            return super.onCapabilityWindowcoveringsState(value, opts);
        }
    }

    async onCapabilityMyPosition(value, opts)
    {
        if (this.setPositionActionName === "setPositionAndLinearSpeed")
        {
            return super.onCapabilityWindowcoveringsSet(0.14, opts);
        }
        else
        {
            return super.onCapabilityMyPosition(value, opts);
        }
    }
}

module.exports = RollerShutterDeviceQuiet;