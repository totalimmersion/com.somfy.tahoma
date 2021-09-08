/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:DiscreteExteriorHeatingIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class HeaterOnOffDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:DiscreteExteriorHeatingIOComponent'];
    }
}

module.exports = HeaterOnOffDriver;