/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the siren with the io:SomfyIndoorSimpleSirenIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class SirenDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:SomfyIndoorSimpleSirenIOComponent'];
    }

}

module.exports = SirenDriver;
