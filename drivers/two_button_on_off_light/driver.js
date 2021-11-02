/*jslint node: true */
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
    }
}

module.exports = two_button_on_offDriver;
