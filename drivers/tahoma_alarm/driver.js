/* jslint node: true */

'use strict';

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

        /** * ALARM STATE CHANGE TRIGGER ** */
        this._triggerTahoma_alarm_stateChange = this.homey.flow.getDeviceTriggerCard('tahoma_alarm_state_changed');
    }

}

module.exports = TahomaAlarmDriver;
