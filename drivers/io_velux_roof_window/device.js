'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for Velux roof windows with the io:WindowOpenerVeluxIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RoofWindowDevice extends WindowCoveringsDevice {
    onInit() {
        super.onInit();

        if (!this.hasCapability("quick_open")) {
            this.addCapability("quick_open");
        }
    }
}

module.exports = RoofWindowDevice;
