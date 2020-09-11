'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for Velus interior blinds with the io:RollerShutterVeluxIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class VeluxRollerShutterDevice extends WindowCoveringsDevice {
    onInit() {
        super.onInit();

        if (!this.hasCapability("quick_open")) {
            this.addCapability("quick_open");
        }
    }
}

module.exports = VeluxRollerShutterDevice;