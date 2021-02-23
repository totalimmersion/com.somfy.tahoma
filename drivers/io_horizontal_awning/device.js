/*jslint node: true */
'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for horizontal awnings with the io:HorizontalAwningIOComponent, io:AwningReceiverUnoIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class HorizontalAwningDevice extends WindowCoveringsDevice
{

    async onInit()
    {
        if (!this.hasCapability("lock_state"))
        {
            this.addCapability("lock_state");
        }

        await super.onInit();

        if (!this.hasCapability("quick_open"))
        {
            this.addCapability("quick_open");
        }

        let dd = this.getData();

        let controllableName = "";
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        if (controllableName !== 'io:awningvalanceiocomponent')
        {
            // From Anders pull request
            this.setPositionActionName = 'setDeployment';

            if (controllableName === 'io:awningreceiverunoiocomponent')
            {
                // No feedback from this device
                this.positionStateName = '';
                this.openClosedStateName = '';
            }
            else
            {
                this.positionStateName = 'core:DeploymentState';
            }
        }
    }
}
module.exports = HorizontalAwningDevice;