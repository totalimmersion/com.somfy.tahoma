'use strict';

const Driver = require('../Driver');

/**
 * Driver class for roller shutters with the io:RollerShutterGenericIOComponent or io:RollerShutterWithLowSpeedManagementIOComponent controllable name in TaHoma
 * @extends {Driver}
 */
class RollerShutterDriver extends Driver {

  onInit() {
    this.deviceType = [
      'io:RollerShutterGenericIOComponent',
      'io:RollerShutterWithLowSpeedManagementIOComponent',
      'io:Re3js3W69CrGF8kKXvvmYtT4zNGqicXRjvuAnmmbvPZXnt',
      'io:MicroModuleRollerShutterSomfyIOComponent'
    ];
  }

}

module.exports = RollerShutterDriver;
