/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

class HorizontalAwningRTSDevice extends WindowCoveringsDevice {

    async onInit() {
        if (this.hasCapability('lock_state'))
        {
            this.removeCapability('lock_state').catch(this.error);
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

module.exports = HorizontalAwningRTSDevice;
