'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the remote controller with the "enocean:EnOceanOnOffLight" controllable name in TaHoma
 * @extends {Driver}
 */
class two_button_on_offDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ["enocean:EnOceanOnOffLight"];
        await super.onInit();

        this.set_on_off = new Homey.FlowCardAction('set_on_off');
        this.set_on_off
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_on_off");
                return args.device.sendOnOff(args.state === "on", null);
            });

        this.set_on_with_timer = new Homey.FlowCardAction('set_on_with_timer');
        this.set_on_with_timer
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_on_with_timer");
                return args.device.sendOnWithTimer(args.onTime, null);
            });
    }
}

module.exports = two_button_on_offDriver;