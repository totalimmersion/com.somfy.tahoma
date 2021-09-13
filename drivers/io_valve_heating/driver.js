/*jslint node: true */
'use strict';

const Homey = require('homey');
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

        this.set_open_window_activationAction = new Homey.FlowCardAction('set_open_window_activation');
        this.set_open_window_activationAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_open_window_activation");
                return args.device.triggerCapabilityListener('open_window_activation', args.open_window_activation == 'on', null);
            });

        this.set_derogation_modeAction = new Homey.FlowCardAction('set_derogation_mode');
        this.set_derogation_modeAction
            .register()
            .registerRunListener(async (args, state) =>
            {
                console.log("set_derogation_mode");
                await args.device.setCapabilityValue('derogation_type', args.type);
                return args.device.triggerCapabilityListener('derogation_mode', args.derogation_mode, null);
            });

        this._derogation_mode_changed = new Homey.FlowCardTriggerDevice('derogation_mode_changed').register();
        this._derogation_mode_changed.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });

        this._valve_heating_mode_state_changed = new Homey.FlowCardTriggerDevice('valve_heating_mode_state_changed').register();
        this._valve_heating_mode_state_changed.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });

        this._defect_state_changed = new Homey.FlowCardTriggerDevice('defect_state_changed').register();
        this._defect_state_changed.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });
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