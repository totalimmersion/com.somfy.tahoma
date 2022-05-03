/* jslint node: true */

'use strict';

const ioWindowCoveringsDriver = require('../ioWindowCoveringsDriver');

/**
 * Driver class for roller shutters with the io:RollerShutterGenericIOComponent or io:Re3js3W69CrGF8kKXvvmYtT4zNGqicXRjvuAnmmbvPZXnt or
 *  MicroModuleRollerShutterSomfyIOComponent or io:RollerShutterUnoIOComponent or io:ScreenReceiverUnoIOComponent controllable name in TaHoma
 * @extends {ioWindowCoveringsDriver}
 */
class RollerShutterDriver extends ioWindowCoveringsDriver
{

    async onInit()
    {
        this.deviceType = [
            'io:RollerShutterGenericIOComponent',
            'io:Re3js3W69CrGF8kKXvvmYtT4zNGqicXRjvuAnmmbvPZXnt',
            'io:MicroModuleRollerShutterSomfyIOComponent',
            'io:RollerShutterUnoIOComponent',
            'io:ScreenReceiverUnoIOComponent',
            'io:RollerShutterWithBatterySomfyIOComponent'
        ];

        await super.onInit();
    }

}

module.exports = RollerShutterDriver;
