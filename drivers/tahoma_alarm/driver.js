/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the Tahoma hub with the internal:TSKAlarmComponent controllable name in TaHoma
 * @extends {Driver}
 */
class TahomaAlarmDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['internal:TSKAlarmComponent'];

        /*** ALARM STATE CHANGE TRIGGER ***/
        this._triggerTahoma_alarm_stateChange = new Homey.FlowCardTriggerDevice('tahoma_alarm_state_changed').register();
        this._triggerTahoma_alarm_stateChange.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });

        this.triggerTahomaAlarmAction = new Homey.FlowCardAction('trigger_tahoma_alarm');
        this.triggerTahomaAlarmAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("trigger_tahoma_alarm");
                return args.device.triggerAlarmAction(args.state);
            });
    }
}

module.exports = TahomaAlarmDriver;