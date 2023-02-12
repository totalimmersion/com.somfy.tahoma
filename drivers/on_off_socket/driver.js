/* jslint node: true */

'use strict';

const Driver = require('../Driver');

class OnOffSocketControllerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:OnOffIOComponent', 'eliot:OnOffSwitchEliotComponent', 'io:SwitchMicroModuleSomfyIOComponent'];
        await super.onInit();
    }

}

module.exports = OnOffSocketControllerDriver;
