/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the siren with the io:SomfyIndoorSimpleSirenIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class SirenDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:SomfyIndoorSimpleSirenIOComponent'];

        this.startSirenAction = new Homey.FlowCardAction('start_siren');
        this.startSirenAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("start_siren");
                return args.device.triggerCapabilityListener('ring_button', null);
            });

        this.stopSirenAction = new Homey.FlowCardAction('stop_siren');
        this.stopSirenAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("stop_siren");
                return args.device.triggerCapabilityListener('stop_button', null);
            });
    }
}

module.exports = SirenDriver;