/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:LockUnlockDoorLockWithUnknownPositionIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class DoorLockDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:LockUnlockDoorLockWithUnknownPositionIOComponent'];
    }

}

module.exports = DoorLockDriver;
