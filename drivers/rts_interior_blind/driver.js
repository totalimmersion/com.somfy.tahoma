/* jslint node: true */

'use strict';

const Driver = require('../Driver');

class InteriorBlindDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['rts:BlindRTSComponent', 'rts:RollerShutterRTSComponent', 'rts:ExteriorBlindRTSComponent', 'rts:SwingingShutterRTSComponent'];
    }

}

module.exports = InteriorBlindDriver;
