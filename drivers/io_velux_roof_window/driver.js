/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for Velux roof windows with the io:WindowOpenerVeluxIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class RoofWindowDriver extends ioWindowCoveringsDriver
{

    async onInit()
    {
        this.deviceType = ['io:WindowOpenerVeluxIOComponent', 'ogp:Window'];

        await super.onInit();
    }

}

module.exports = RoofWindowDriver;
