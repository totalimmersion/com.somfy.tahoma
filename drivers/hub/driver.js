/* jslint node: true */

'use strict';

const Driver = require('../Driver');

class HubDriver extends Driver
{
    async onInit()
    {
        this.deviceType = ['internal:PodV2Component', 'internal:PodMiniComponent', 'internal:PodV3Component'];
    }

}

module.exports = HubDriver;
