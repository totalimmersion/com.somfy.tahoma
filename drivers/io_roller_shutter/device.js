'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for roller shutters with the io:RollerShutterGenericIOComponent or io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDevice extends WindowCoveringsDevice {
    onInit()
    {
        super.onInit();

        if ( this.hasCapability( 'silent_mode' ) )
        {
            this.registerCapabilityListener( 'silent_mode', this.onCapabilitySilentMode.bind( this ) );
            this.silentMode = this.getCapabilityValue( 'silent_mode' );
            this.setPositionActionName = 'setPositionAndLinearSpeed';
        }
    }

    async onAdded()
    {
        const devData = this.getData();
        if ( devData.controllableName == 'io:RollerShutterWithLowSpeedManagementIOComponent' )
        {
            this.addCapability( 'silent_mode' );
            this.silentMode = this.getCapabilityValue( 'silent_mode' );
            this.setPositionActionName = 'setPositionAndLinearSpeed';
        }
    }

    async onCapabilitySilentMode( value, opts )
    {
        this.silentMode = value;
    }
}

module.exports = RollerShutterDevice;
