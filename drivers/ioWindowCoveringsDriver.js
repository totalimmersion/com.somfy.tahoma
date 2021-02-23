/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('./Driver');
class ioWindowCoveringsDriver extends Driver
{
    async onInit()
    {
        this._conditionIsMoving = new Homey.FlowCardCondition('is_moving').register();
        this._conditionIsMoving.registerRunListener(args => {
          let device = args.device;
          let conditionMet = (device.executionId !== null);
          return Promise.resolve(conditionMet);
        });

        super.onInit();    
    }
}

module.exports = ioWindowCoveringsDriver;