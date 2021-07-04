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
        this.checkLockStateTimer = null;
        this.checkLockSate = this.checkLockSate.bind(this);

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

    checkLockSate()
    {
        this._checkLockSate();
    }

    async _checkLockSate()
    {
        const states = await this.getStates();
        if (states)
        {
            // Look for each of the required capabilities
            const lockState = states.find(state => state.name === "io:PriorityLockOriginatorState");
            if (lockState)
            {
                this.setCapabilityValue("lock_state", lockState.value);
                clearTimeout(this.checkLockStateTimer);
                this.checkLockStateTimer = setTimeout(this.checkLockSate, (60 * 1000));
            }
            else
            {
                const lockStateTimer = states.find(state => state.name === "core:PriorityLockTimerState");
                if (lockStateTimer)
                {
                    if (lockStateTimer.value === 0)
                    {
                        this.setCapabilityValue("lock_state", "");
                    }
                    else
                    {
                        clearTimeout(this.checkLockStateTimer);
                        this.checkLockStateTimer = setTimeout(this.checkLockSate, (60 * 1000));
                    }
                }
            }
        }
    }
}
module.exports = HorizontalAwningDevice;