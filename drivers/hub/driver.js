/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the Tahoma hub with the internal:PodV2Component and internal:PodMiniComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HubDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['internal:PodV2Component', 'internal:PodMiniComponent'];

        this.turnOnCalendarAction = new Homey.FlowCardAction('calendar_state_on');
        this.turnOnCalendarAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("calendar_state_on");
                return args.device.triggerCapabilityListener('calendar_state_on', true, null);
            });

        this.turnOffCalendarAction = new Homey.FlowCardAction('calendar_state_off');
        this.turnOffCalendarAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("calendar_state_off");
                return args.device.triggerCapabilityListener('calendar_state_off', true, null);
            });
    }
}

module.exports = HubDriver;