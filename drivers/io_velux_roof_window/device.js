/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for Velux roof windows with the io:WindowOpenerVeluxIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RoofWindowDevice extends WindowCoveringsDevice {

    async onInit() {
        if (!this.hasCapability('lock_state')) {
            this.addCapability('lock_state');
        }

        await super.onInit();

        if (!this.hasCapability('quick_open')) {
            this.addCapability('quick_open').catch(this.error);
        }
    }

}

module.exports = RoofWindowDevice;
