/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for horizontal awnings with the io:VerticalInteriorBlindGenericIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class HorizontalAwningDriver extends ioWindowCoveringsDriver
{

    async onInit()
    {
        this.deviceType = ['io:VerticalInteriorBlindGenericIOComponent'];

        await super.onInit();
    }

}

module.exports = HorizontalAwningDriver;
