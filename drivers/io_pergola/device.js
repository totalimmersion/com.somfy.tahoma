'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class PergolaDevice extends WindowCoveringsDevice {
    async onInit() {
        if (this.hasCapability("lock_state")) {
            this.removeCapability("lock_state");
        }

        await super.onInit();

        this.windowcoveringsActions = {
            up: 'openSlats',
            idle: null,
            down: 'closeSlats'
        };

        this.closureStateName = 'core:SlatsOrientationState';
        this.setPositionActionName = 'setOrientation';
        this.openClosedStateName = 'core:SlatsOpenClosedState';

    }
}

module.exports = PergolaDevice;