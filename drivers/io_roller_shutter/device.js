'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for roller shutters with the io:RollerShutterGenericIOComponent or io:Re3js3W69CrGF8kKXvvmYtT4zNGqicXRjvuAnmmbvPZXnt or MicroModuleRollerShutterSomfyIOComponent controllable controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDevice extends WindowCoveringsDevice {
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

module.exports = RollerShutterDevice;