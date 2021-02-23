/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:SomfyContactIOSystemSensor and rtds:RTDSContactSensor controllable name in TaHoma
 * @extends {Driver}
 */
class OpeningDetectorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:SomfyContactIOSystemSensor', 'rtds:RTDSContactSensor'];

        /*** CONTACT TRIGGERS ***/
        this._triggerContactChange = new Homey.FlowCardTriggerDevice('contact_has_changed').register();
        this._triggerContactChange.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });
    }

    triggerFlows(device, capability, value)
    {
        const tokens = {
            'isOpen': value
        };
        this.triggerFlow(this._triggerContactChange, device, tokens);
    }
}

module.exports = OpeningDetectorDriver;