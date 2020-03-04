'use strict';

const SensorDevice = require( '../SensorDevice' );
const Tahoma = require( '../../lib/Tahoma' );
const genericHelper = require( '../../lib/helper' ).Generic;
const deviceHelper = require( '../../lib/helper' ).Device;

/**
 * Device class for the light controller with the myfox:LightController controllable name in TaHoma
 * @extends {SensorDevice}
 */

class myFoxLightControllerDevice extends SensorDevice
{
    onInit()
    {
        super.onInit();
        this.lightState = {
            off: false,
            on: true
        };

        this.registerCapabilityListener( 'onoff', this.onCapabilityOnOff.bind( this ) );
    }

    onCapabilityOnOff( value, opts, callback )
    {
        const deviceData = this.getData();
        if ( !opts.fromCloudSync )
        {
            var action;
            if ( value == false )
            {
                action = {
                    name: 'off',
                    parameters: []
                };
            }
            else
            {
                action = {
                    name: 'on',
                    parameters: []
                };
            }
            Tahoma.executeDeviceAction( deviceData.label, deviceData.deviceURL, action )
                .then( result =>
                {
                    this.setStoreValue( 'executionId', result.execId );
                    this.setCapabilityValue( 'onoff', (value == true) );
                    if ( callback ) callback( null, value );
                } )
                .catch( error =>
                {
                    console.log( error.message, error.stack );
                } );
        }
        else
        {
            this.setCapabilityValue( 'onoff', (value == true) );
		}
		
		//return Promise.resolve();
    }

    /**
     * Gets the data from the TaHoma cloud
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

        Tahoma.getDeviceStateHistory( this.getDeviceUrl(), 'core:OnOffState', from, to )
            .then( data =>
            {
                //process result
                if ( data.historyValues && data.historyValues.length > 0 )
                {
                    const
                    {
                        value
                    } = genericHelper.getLastItemFrom( data.historyValues );
                    this.triggerCapabilityListener( 'onoff', (value === 'on'),
                    {
                        fromCloudSync: true
                    } );
                    return;
                }
            } )
            .catch( error =>
            {
                console.log( error.message, error.stack );
            } );
 

        const OnOffState = device.states.find( state => state.name === 'core:OnOffState' );
        this.triggerCapabilityListener( 'onoff', (OnOffState.value === 'on'),
        {
            fromCloudSync: true
        } );

    }
}

module.exports = myFoxLightControllerDevice;