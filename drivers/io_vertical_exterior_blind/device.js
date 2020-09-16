'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for vertical exterior blinds with the io:VerticalExteriorAwningIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class VerticalExteriorBlindDevice extends WindowCoveringsDevice {
    async onInit() {
        await super.onInit();

        if (!this.hasCapability("quick_open")) {
            this.addCapability("quick_open");
        }
    }
}

module.exports = VerticalExteriorBlindDevice;
