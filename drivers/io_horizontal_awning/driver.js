'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for horizontal awnings with the io:HorizontalAwningIOComponent, io:AwningReceiverUnoIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class HorizontalAwningDriver extends ioWindowCoveringsDriver
{
    async onInit()
    {
        this.deviceType = ['io:HorizontalAwningIOComponent', 'io:AwningValanceIOComponent', 'io:AwningvalanceIOComponent', 'io:AwningReceiverUnoIOComponent'];

        await super.onInit();
    }

}

module.exports = HorizontalAwningDriver;