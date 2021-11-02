/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:SomfyContactIOSystemSensor, rtds:RTDSContactSensor and io:SomfyBasicContactIOSystemSensor controllable name in TaHoma
 * @extends {Driver}
 */
class OpeningDetectorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:SomfyContactIOSystemSensor', 'rtds:RTDSContactSensor', 'io:SomfyBasicContactIOSystemSensor'];

        /** * CONTACT TRIGGERS ** */
        this._triggerContactChange = this.homey.flow.getDeviceTriggerCard('contact_has_changed');
        this._triggerContactChange.registerRunListener(() =>
        {
            return Promise.resolve(true);
        });
    }

    triggerFlows(device, capability, value)
    {
        const tokens = {
            isOpen: value,
        };
        this.triggerFlow(this._triggerContactChange, device, tokens);
    }

}

module.exports = OpeningDetectorDriver;
