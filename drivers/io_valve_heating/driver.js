/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:HeatingValveIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ElectricHeaterDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:HeatingValveIOComponent'];

        this._derogation_mode_changed = this.homey.flow.getDeviceTriggerCard('derogation_mode_changed');
        this._valve_heating_mode_state_changed = this.homey.flow.getDeviceTriggerCard('valve_heating_mode_state_changed');
        this._defect_state_changed = this.homey.flow.getDeviceTriggerCard('defect_state_changed');
    }

    triggerFlows(device, capability, value)
    {
        //     if (capability === 'derogation_mode')
        //     {
        //         const state = {
        //             'derogation_mode': value
        //         };

        //         this.triggerFlow(this._derogation_mode_changed, device, null, state);
        //     }
        //     else if (capability === 'valve_heating_mode')
        //     {
        //         const state = {
        //             'valve_heating_mode_state': value
        //         };

        //         this.triggerFlow(this._valve_heating_mode_state_changed, device, null, state);
        //     }
        //     else if (capability === 'defect_state')
        //     {
        //         const tokens = {
        //             'defect_state': value
        //         };

        //         this.triggerFlow(this._valve_heating_mode_state_changed, device, tokens);
        //     }
    }

}

module.exports = ElectricHeaterDriver;
