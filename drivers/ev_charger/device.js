/* jslint node: true */

'use strict';

const LightControllerDevice = require('../LightControllerDevice');

/**
 * Device class for the light controller with the eliot:ElectricVehicleChargerComponent controllable name in TaHoma
 * @extends {LightControllerDevice}
 */

class evChargerDevice extends LightControllerDevice
{

    async onInit()
    {
        const dd = this.getData();

        let controllableName = '';
        if (dd.controllableName)
        {
            controllableName = dd.controllableName.toString().toLowerCase();
        }

        this.registerCapabilityListener('on_with_timer', this.sendOnWithTimer.bind(this));
        //this.setCapabilityValue('on_with_timer', 0).catch(this.error);

        await super.onInit();
        this.getStates();
    }

}

module.exports = evChargerDevice;
