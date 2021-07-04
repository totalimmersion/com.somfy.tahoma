/*jslint node: true */
'use strict';
const Homey = require('homey');

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the rts:VenetianBlindRTSComponent and rts:ExteriorVenetianBlindRTSComponent controllable name in TaHoma
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
        this.boostSync = true;
    }

    async sync() {
        // No states are available so no need to call anything
    }
}

module.exports = InteriorVenetianBlindDevice;