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

        this.startSirenAction = new Homey.FlowCardAction('sound_alarm1');
        this.startSirenAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("sound_alarm1");
                let parameters = [args.duration * 1000, args.on_off_ratio, args.repeats - 1, args.volume];
                return args.device.triggerCapabilityListener('soundAlarm_1_button', null, parameters);
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