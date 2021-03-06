/*jslint node: true */
'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the rts:DualCurtainRTSComponent, rts:CurtainRTSComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class InteriorCurtainDevice extends WindowCoveringsDevice {
    async onInit() {
        if (this.hasCapability("lock_state")) {
            this.removeCapability("lock_state");
        }
        
        if (!this.hasCapability("my_position")) {
            this.addCapability("my_position");
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

module.exports = InteriorCurtainDevice;