'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for Velus interior blinds with the io:RollerShutterVeluxIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class VeluxRollerShutterDevice extends WindowCoveringsDevice {
    async onInit() {
        if (this.hasCapability("lock_state")) {
            this.removeCapability("lock_state");
        }

        await super.onInit();

        if (!this.hasCapability("quick_open")) {
            this.addCapability("quick_open");
        }
    }
}

module.exports = VeluxRollerShutterDevice;