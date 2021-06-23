/*jslint node: true */
'use strict';

const Homey = require('homey');
const Driver = require('./Driver');
class ioWindowCoveringsDriver extends Driver
{
    async onInit()
    {
        super.onInit();    
    }
}

module.exports = ioWindowCoveringsDriver;