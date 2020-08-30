"use strict";

const WindowCoveringsDevice = require("../WindowCoveringsDevice");

/**
 * Device class for roller shutters with the io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDeviceQuiet extends WindowCoveringsDevice {
  onInit() {
    super.onInit();

    if (!this.hasCapability("my_position")) {
      this.addCapability("my_position");
    }

    this.registerCapabilityListener("quiet_mode",
      this.onCapabilityQuietMode.bind(this)
    );

    this.quietMode = this.getCapabilityValue("quiet_mode");
    if (this.quietMode) {
      return this.setPositionActionName = "setPositionAndLinearSpeed";
    } else {
      return this.setPositionActionName = "setClosure";
    }
  }

  async onCapabilityQuietMode(value, opts) {
    this.quietMode = value;
    if (value) {
      return this.setPositionActionName = "setPositionAndLinearSpeed";
    } else {
      return this.setPositionActionName = "setClosure";
    }
  }

  async onCapabilityWindowcoveringsState(value, opts) {
    if (
      !opts.fromCloudSync &&
      this.setPositionActionName === "setPositionAndLinearSpeed" &&
      (value === "up" || value === "down")
    ) {
      return super.onCapabilityWindowcoveringsSet(value === "up" ? 1 : 0, opts);
    } else {
      return super.onCapabilityWindowcoveringsState(value, opts);
    }
  }

  async onCapabilityMyPosition(value, opts) {
    if (this.setPositionActionName === "setPositionAndLinearSpeed") {
      return super.onCapabilityWindowcoveringsSet(0.14, opts);
    } else {
      return super.onCapabilityMyPosition(value, opts);
    }
  }
}

module.exports = RollerShutterDeviceQuiet;