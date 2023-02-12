/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for roller shutters with the io:RollerShutterGenericIOComponent or
 *  io:Re3js3W69CrGF8kKXvvmYtT4zNGqicXRjvuAnmmbvPZXnt or
 *  MicroModuleRollerShutterSomfyIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class RollerShutterDevice extends WindowCoveringsDevice
{

    async onInit()
    {
        if (this.hasCapability('lock_state'))
        {
            this.removeCapability('lock_state').catch(this.error);
        }

        const dd = this.getData();
        let controllableName = '';
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if ((controllableName === 'io:rollershuttergenericiocomponent') || (controllableName === 'io:rollershutterunoiocomponent') || (controllableName === 'io:screenreceiverunoiocomponent') || (controllableName === 'io:rollershutterwithbatterysomfyiocomponent'))
        {
            if (!this.hasCapability('my_position'))
            {
                this.addCapability('my_position').catch(this.error);
            }
        }
        else if (this.hasCapability('my_position'))
        {
            this.removeCapability('my_position').catch(this.error);
        }

        if (controllableName === 'io:rollershutterwithbatterysomfyiocomponent')
        {
            if (!this.hasCapability('measure_battery'))
            {
                this.addCapability('measure_battery').catch(this.error);
            }
        }

        await super.onInit();

        if (!this.hasCapability('quick_open'))
        {
            this.addCapability('quick_open').catch(this.error);
        }

        if (controllableName === 'io:screenreceiverunoiocomponent')
        {
            // No feedback from this device
            this.positionStateName = 'core:TargetClosureState';
            this.openClosedStateName = '';

            this.setPositionActionName = 'setPosition';
        }
    }

}

module.exports = RollerShutterDevice;
