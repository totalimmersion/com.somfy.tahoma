'use strict';

const WindowCoveringsDevice = require( '../WindowCoveringsDevice' );

/**
 * Device class for roller shutters with the io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDeviceQuiet extends WindowCoveringsDevice
{
    onInit()
    {
        super.onInit();

        this.registerCapabilityListener( 'silent_mode', this.onCapabilitySilentMode.bind( this ) );
        this.silentMode = this.getCapabilityValue( 'silent_mode' );
        if ( this.silentMode )
        {
            this.setPositionActionName = 'setPositionAndLinearSpeed';
        }
        else
        {
            this.setPositionActionName = 'setClosure';
        }

        let setQuiteModeAction = new Homey.FlowCardAction( 'set_quite_mode' );
        setQuiteModeAction
            .register()
            .registerRunListener( async ( args, state ) =>
            {
                await args.device.onCapabilitySilentMode( args.state == 'on', null );
                return args.device.setCapabilityValue( 'silent_mode', args.state == 'on' );
            } )
    }

    async onCapabilitySilentMode( value, opts )
    {
        this.silentMode = value;
        if ( value )
        {
            this.setPositionActionName = 'setPositionAndLinearSpeed';
        }
        else
        {
            this.setPositionActionName = 'setClosure';
        }
    }
}

module.exports = RollerShutterDeviceQuiet;