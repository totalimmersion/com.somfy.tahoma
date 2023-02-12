/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:DimmableLightIOComponent, hue:GenericDimmableLightHUEComponent or io:DimmableLightMicroModuleSomfyIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class DimmableLightControllerDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:DimmableLightIOComponent', 'hue:HueLuxHUEComponent', 'hue:GenericDimmableLightHUEComponent', 'ogp:Light', 'io:DimmableLightMicroModuleSomfyIOComponent', 'eliot:DimmerLightEliotComponent', 'zwave:DimmableOnOffZWaveComponent'];
        await super.onInit();
    }

}

module.exports = DimmableLightControllerDriver;
