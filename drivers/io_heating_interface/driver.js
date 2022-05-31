/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:AtlanticElectricalHeaterIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class IOHeaterDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:AtlanticElectricalHeaterIOComponent'];
    }
}

module.exports = IOHeaterDriver;
