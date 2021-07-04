/*jslint node: true */
'use strict';

const Homey = require( 'homey' );
const Driver = require( '../Driver' );

/**
 * Driver class for the opening detector with the ovp:SomfyPilotWireHeatingInterfaceOVPComponent controllable name in TaHoma
 * @extends {Driver}
 */
class PilotWireProgrammerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = [ 'ovp:SomfyPilotWireHeatingInterfaceOVPComponent' ];
    }

}

module.exports = PilotWireProgrammerDriver;