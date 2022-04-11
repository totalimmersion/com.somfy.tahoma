/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

class HorizontalAwningRTSDevice extends WindowCoveringsDevice {

    async onInit() {
        if (this.hasCapability('lock_state'))
        {
            this.removeCapability('lock_state').catch(this.error);
        }

        if (this.hasCapability('windowcoverings_state.rts'))
        {
            this.removeCapability('windowcoverings_state.rts').catch(this.error);
            this.addCapability('windowcoverings_state').catch(this.error);
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
