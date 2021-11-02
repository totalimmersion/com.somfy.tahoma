/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the remote controller with the "enocean:EnOceanOnOffLight" controllable name in TaHoma
 * @extends {Driver}
 */
// eslint-disable-next-line camelcase
class two_button_on_offDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['enocean:EnOceanOnOffLight'];
        await super.onInit();
    }

}

// eslint-disable-next-line camelcase
module.exports = two_button_on_offDriver;
