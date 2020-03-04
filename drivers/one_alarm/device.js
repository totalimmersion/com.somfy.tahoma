'use strict';

const SensorDevice = require( '../SensorDevice' );
const Tahoma = require( '../../lib/Tahoma' );
const genericHelper = require( '../../lib/helper' ).Generic;
const deviceHelper = require( '../../lib/helper' ).Device;

/**
 * Device class for the opening detector with the io:SomfyContactIOSystemSensor controllable name in TaHoma
 * @extends {SensorDevice}
 */

class OneAlarmDevice extends SensorDevice
{
    onInit()
    {
        super.onInit();
        this.alarmArmedState = {
            armed: 'armed',
            disarmed: 'disarmed',
            partial: 'partially_armed'
        };

		this.alarmTriggeredStatesMap = {
            detected: 'detected',
            notDetected: 'notDetected'
        };

        this.registerCapabilityListener( 'homealarm_state', this.onCapabilityAlarmArmedState.bind( this ) );
        this.registerCapabilityListener( 'alarm_generic', this.onCapabilityAlarmTriggeredState.bind( this ) );
    }

    onCapabilityAlarmTriggeredState( value )
    {
        const oldTriggeredState = this.getState().alarm_generic;
        if ( oldTriggeredState !== value )
        {
            this.setCapabilityValue( 'alarm_generic', value );

            const device = this;
            const tokens = {
                'isTriggered': value
            };

            const state = {
                'alarm_generic': value
            };
        }

        return Promise.resolve();
    }

    onCapabilityAlarmArmedState( value, opts, callback )
    {
        const deviceData = this.getData();
        if ( !opts.fromCloudSync )
        {
            var action;
            if ( value == 'armed' )
            {
                action = {
                    name: 'arm',
                    parameters: []
                };
            }
            if ( value == 'disarmed' )
            {
                action = {
                    name: 'disarm',
                    parameters: []
                };
            }
            if ( value == 'partially_armed' )
            {
                action = {
                    name: 'partial',
                    parameters: []
                };
            }
            Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action )
                .then( result =>
                {
                    this.setStoreValue( 'executionId', result.execId );
                    this.setCapabilityValue( 'homealarm_state', value );
                    if ( callback ) callback( null, value );
                } )
                .catch( error =>
                {
                    console.log( error.message, error.stack );
                } );
        }
        else
        {
            this.setCapabilityValue( 'homealarm_state', value );
		}
		
		return Promise.resolve();
    }

    /**
     * Gets the sensor data from the TaHoma cloud
     * @param {Array} data - device data from all the devices in the TaHoma cloud
     */
    sync( data )
    {
        const device = data.find( deviceHelper.isSameDevice( this.getData().id ), this );

        if ( !device )
        {
            this.setUnavailable( null );
            return;
        }

        const range = 15 * 60 * 1000; //range of 15 minutes
        const to = Date.now();
        const from = to - range;

        Tahoma.getDeviceStateHistory( this.getDeviceUrl(), 'core:IntrusionState', from, to )
            .then( data =>
            {
                //process result
                if ( data.historyValues && data.historyValues.length > 0 )
                {
                    const
                    {
                        value
                    } = genericHelper.getLastItemFrom( data.historyValues );
                    this.triggerCapabilityListener( 'alarm_generic', value === 'detected' );
                }
            } )
            .catch( error =>
            {
                console.log( error.message, error.stack );
            } );
 

        const states = device.states
            .filter( state => state.name === 'myfox:AlarmStatusState')
            .map( state =>
            {
                const value = this.alarmArmedState[ state.value ] ? this.alarmArmedState[ state.value ] : state.value;
                return {
                    name: state.name === 'myfox:AlarmStatusState' ? 'armedState' : '',
                    value
                };
            } );

        const ArmedState = states.find( state => state.name === 'armedState' );
        this.triggerCapabilityListener( 'homealarm_state', ArmedState.value,
        {
            fromCloudSync: true
        } );

    }
}

module.exports = OneAlarmDevice;