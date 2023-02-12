/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class ExteriorVenetianBlindDevice extends WindowCoveringsDevice {

    async onInit() {
        if (this.hasCapability('lock_state')) {
            this.removeCapability('lock_state').catch(this.error);
        }

        if (!this.hasCapability('quick_open')) {
            this.addCapability('quick_open').catch(this.error);
        }

        if (!this.hasCapability('windowcoverings_tilt_set')) {
            this.addCapability('windowcoverings_tilt_set').catch(this.error);
        }

        await super.onInit();
    }

}

module.exports = ExteriorVenetianBlindDevice;
