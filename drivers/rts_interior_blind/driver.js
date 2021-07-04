/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

class InteriorBlindDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:BlindRTSComponent', 'rts:RollerShutterRTSComponent', 'rts:ExteriorBlindRTSComponent'];

        this.set_my_position = new Homey.FlowCardAction('set_my_position');
        this.set_my_position
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_my_position");
                return args.device.onCapabilityMyPosition(true, null);
            });
    }

}

module.exports = InteriorBlindDriver;