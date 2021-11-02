/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for exterior venetian blinds with the io:SimpleBioclimaticPergolaIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class PergolaDriver extends ioWindowCoveringsDriver
{

    async onInit()
    {
        this.deviceType = ['io:SimpleBioclimaticPergolaIOComponent'];

        await super.onInit();
    }

}

module.exports = PergolaDriver;
