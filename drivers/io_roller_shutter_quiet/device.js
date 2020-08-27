'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for roller shutters with the io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDeviceQuiet extends WindowCoveringsDevice {
    onInit() {
        super.onInit();

        if (!this.hasCapability('my_position')) {
            this.addCapability('my_position');
        }

        this.registerCapabilityListener('quiet_mode', this.onCapabilityQuietMode.bind(this));

        this.quietMode = this.getCapabilityValue('quiet_mode');
        if (this.quietMode) {
            this.setPositionActionName = 'setPositionAndLinearSpeed';
        } else {
            this.setPositionActionName = 'setClosure';
        }
    }

    async onCapabilityQuietMode(value, opts) {
        this.quietMode = value;
        if (value) {
            this.setPositionActionName = 'setPositionAndLinearSpeed';
        } else {
            this.setPositionActionName = 'setClosure';
        }
    }

    async onCapabilityWindowcoveringsState(value, opts) {
        if (!opts.fromCloudSync && (this.setPositionActionName === 'setPositionAndLinearSpeed') && ((value === 'up') || (value === 'down'))) {
            super.onCapabilityWindowcoveringsSet(value === 'up' ? 0 : 1, opts);
        } else {
            super.onCapabilityWindowcoveringsState(value, opts);
        }
    }
}

module.exports = RollerShutterDeviceQuiet;