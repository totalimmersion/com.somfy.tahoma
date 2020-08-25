'use strict';

const Device = require( './Device' );
const Tahoma = require( '../lib/Tahoma' );
const deviceHelper = require( '../lib/helper' ).Device;

/**
 * Base class for window coverings devices
 * @extends {Device}
 */
class WindowCoveringsDevice extends Device
{
    onInit()
    {
        this.windowcoveringsActions = {
            up: 'open',
            idle: null,
            down: 'close'
        };

        this.windowcoveringsStatesMap = {
            open: 'up',
            closed: 'down'
        };

        // From Anders pull request
        this.closureStateName = 'core:ClosureState';
        this.setPositionActionName =  'setClosure';
        this.silentMode = false;

        this.registerCapabilityListener( 'windowcoverings_state', this.onCapabilityWindowcoveringsState.bind( this ) );
        this.registerCapabilityListener( 'windowcoverings_set', this.onCapabilityWindowcoveringsSet.bind( this ) );
        this.registerCapabilityListener( 'windowcoverings_tilt_up', this.onCapabilityWindowcoveringsTiltUp.bind( this ) );
        this.registerCapabilityListener( 'windowcoverings_tilt_down', this.onCapabilityWindowcoveringsTiltDown.bind( this ) );
        this.registerCapabilityListener( 'my_position', this.onCapabilityMyPosition.bind( this ) );
        super.onInit();
    }

    async onCapabilityWindowcoveringsState( value, opts )
    {
        if ( !opts.fromCloudSync )
        {
            const deviceData = this.getData();
            if ( value === 'idle' && this.getStoreValue( 'executionId' ))
            {
                Tahoma.cancelExecution( this.getStoreValue( 'executionId' ) );
            }
            else
            {
                await Tahoma.cancelExecution( this.getStoreValue( 'executionId' ) );
                const action = {
                    name: this.windowcoveringsActions[ value ],
                    parameters: []
                }
                let result = await Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action );
                this.setStoreValue( 'executionId', result.execId );
            };

            if (!this.closureStateName)
            {
                setTimeout(() => {
                    this.setCapabilityValue( 'windowcoverings_state', null );
                }, 500 );
            }
        }
        else
        {
            // New value from Tahoma
            this.setCapabilityValue( 'windowcoverings_state', value );
        }
    }

    async onCapabilityWindowcoveringsSet( value, opts )
    {
        if ( !opts.fromCloudSync )
        {
            const deviceData = this.getData();
            const action = {
                name: this.setPositionActionName, // Anders pull request
                parameters: [ Math.round( ( 1 - value ) * 100 ) ]
            };

            if ( this.setPositionActionName === 'setPositionAndLinearSpeed' )
            {
                // Add slow speed option if silent mode is selected
                action.parameters.push( "lowspeed" );
            }
            let result = await Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action )
            this.setStoreValue( 'executionId', result.execId );
        }
        else
        {
            // New value from Tahoma
            this.setCapabilityValue( 'windowcoverings_set', value ); 
        }
    }

    async onCapabilityWindowcoveringsTiltUp( value, opts )
    {
        if ( !opts.fromCloudSync )
        {
            const deviceData = this.getData();
            await Tahoma.cancelExecution( this.getStoreValue( 'executionId' ) );
            const action = {
                name: 'tiltPositive',
                parameters: [ 3, 1 ]
            };
            let result = await Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action )
            this.setStoreValue( 'executionId', result.execId );
        }
    }

    async onCapabilityWindowcoveringsTiltDown( value, opts )
    {
        if ( !opts.fromCloudSync )
        {
            const deviceData = this.getData();
            await Tahoma.cancelExecution( this.getStoreValue( 'executionId' ) );
            const action = {
                name: 'tiltNegative',
                parameters: [ 3, 1 ]
            };
            let result = await Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action )
            this.setStoreValue( 'executionId', result.execId );
        }
    }

    async onCapabilityMyPosition( value, opts )
    {
        if ( !opts || !opts.fromCloudSync )
        {
            const deviceData = this.getData();
            await Tahoma.cancelExecution( this.getStoreValue( 'executionId' ) );
            const action = {
                name: 'my'
            };
            let result = await Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action )
            this.setStoreValue( 'executionId', result.execId );
        }
    }


    /**
     * Sync the state of the devices from the TaHoma cloud with Homey
     * @param {Array} data - device data from all the devices in the TaHoma cloud
     */
    sync( data )
    {
        const device = data.find( deviceHelper.isSameDevice( this.getData().id ), this );

        if ( device )
        {
            if ( device.states )
            {
                //device exists -> let's sync the state of the device
                const states = device.states
                    .filter( state => state.name === 'core:OpenClosedState' || state.name === this.closureStateName ) // Anders pull request
                    .map( state =>
                    {
                        const value = this.windowcoveringsStatesMap[ state.value ] ? this.windowcoveringsStatesMap[ state.value ] : state.value;
                        return {
                            name: state.name === 'core:OpenClosedState' ? 'openClosedState' : 'closureState',
                            value
                        };
                    } );

                const closureState = states.find( state => state.name === 'closureState' );
                const openClosedState = states.find( state => state.name === 'openClosedState' );
                openClosedState.value = ( closureState.value !== 0 && closureState.value !== 100 ) ? 'idle' : openClosedState.value;
                openClosedState.value = ( openClosedState.value === 'open' ? 'up' : openClosedState.value === 'closed' ? 'down' : openClosedState.value);
                this.log( this.getName(), 'state', openClosedState.value, closureState.value );
                this.triggerCapabilityListener( 'windowcoverings_state', openClosedState.value,
                {
                    fromCloudSync: true
                } );
                this.triggerCapabilityListener( 'windowcoverings_set', 1 - ( closureState.value / 100 ),
                {
                    fromCloudSync: true
                } );
            }
            else if ( this.hasCapability( 'windowcoverings_state' ) )
            {
                this.setCapabilityValue( 'windowcoverings_state', null );
            }
        }
        else
        {
            //device was not found in TaHoma response -> remove device from Homey
            this.setUnavailable( null );
        }
    }
}

module.exports = WindowCoveringsDevice;
