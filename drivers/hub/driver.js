/* jslint node: true */

'use strict';

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
    }

}

module.exports = HubDriver;
