'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for Velus interior blinds with the io:VerticalInteriorBlindVeluxIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class VeluxInteriorBlindDevice extends WindowCoveringsDevice {
    onInit() {
        super.onInit();

        if (!this.hasCapability("quick_open")) {
            this.addCapability("quick_open");
        }
    }
}

module.exports = VeluxInteriorBlindDevice;