/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:DimmableLightIOComponent or hue:GenericDimmableLightHUEComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HeaterVariableDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:SimpleExteriorHeatingIOComponent'];
    }

}

module.exports = HeaterVariableDriver;
