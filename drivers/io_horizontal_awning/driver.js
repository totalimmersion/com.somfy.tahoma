/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

class HorizontalAwningDriver extends ioWindowCoveringsDriver
{

    async onInit()
    {
        this.deviceType = ['io:HorizontalAwningIOComponent', 'io:AwningValanceIOComponent', 'io:AwningvalanceIOComponent', 'io:AwningReceiverUnoIOComponent', 'ogp:Awning', 'io:PergolaRailGuidedAwningIOComponent'];

        await super.onInit();
    }

}

module.exports = HorizontalAwningDriver;
