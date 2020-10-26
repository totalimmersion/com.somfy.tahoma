'use strict';
const Homey = require('homey');

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class InteriorVenetianBlindDevice extends WindowCoveringsDevice {
    async onInit() {
        if (this.hasCapability("lock_state")) {
            this.removeCapability("lock_state");
        }

        await super.onInit();

        this.positionStateName = '';
        this.openClosedStateName = '';
        this.boostSync = false;
    }

    async sync() {
        // No states are available so no need to call anything
    }
}

module.exports = InteriorVenetianBlindDevice;