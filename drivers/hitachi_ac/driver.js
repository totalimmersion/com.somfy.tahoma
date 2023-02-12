/* jslint node: true */

'use strict';

const Driver = require('../Driver');
class HitachiACDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['ovp:HLinkMainController'];
    }

}

module.exports = HitachiACDriver;
