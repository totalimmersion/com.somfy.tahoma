'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:HeatingValveIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class ElectricHeaterDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:HeatingValveIOComponent'];
    }
}

module.exports = ElectricHeaterDriver;