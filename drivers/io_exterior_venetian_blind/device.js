'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class ExteriorVenetianBlindDevice extends WindowCoveringsDevice {
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

module.exports = ExteriorVenetianBlindDevice;