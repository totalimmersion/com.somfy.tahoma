/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

class InteriorBlindDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:BlindRTSComponent', 'rts:RollerShutterRTSComponent', 'rts:ExteriorBlindRTSComponent'];
    }

}

module.exports = InteriorBlindDriver;
