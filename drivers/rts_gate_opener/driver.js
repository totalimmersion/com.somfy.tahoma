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

        this.openCloseAction = new Homey.FlowCardAction('set_open_close_stop');
        this.openCloseAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("open_close_stop");
                return args.device.sendOpenCloseStop(args.state, null);
            });
    }
}

module.exports = rtsGateOpenerDriver;