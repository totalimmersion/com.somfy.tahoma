/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the remote controller with the "rts:GateOpenerRTSComponent" controllable name in TaHoma
 * @extends {Driver}
 */
class rtsGateOpenerDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ["rts:GateOpenerRTSComponent"];
        await super.onInit();
    }
}

module.exports = rtsGateOpenerDriver;
