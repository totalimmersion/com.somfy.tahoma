/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the light sensor with the io:CumulatedElectricalEnergyConsumptionIOSystemDeviceSensor io:TotalElectricalEnergyConsumptionIOSystemSensor,
 *  io:TotalElectricalEnergyConsumptionSensor, io:OtherElectricalEnergyConsumptionSensor, io:PlugsElectricalEnergyConsumptionSensor, io:DHWElectricalEnergyConsumptionSensor,
 *  io:CoolingRelatedElectricalEnergyConsumptionSensor, io:HeatingRelatedElectricalEnergyConsumptionSensor & io:HeatingElectricalEnergyConsumptionSensor controllable name in TaHoma
 * @extends {Driver}
 */
class EnergySensorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:TotalElectricalEnergyConsumptionIOSystemSensor',
            'io:TotalElectricalEnergyConsumptionSensor',
            'io:OtherElectricalEnergyConsumptionSensor',
            'io:PlugsElectricalEnergyConsumptionSensor',
            'io:DHWElectricalEnergyConsumptionSensor',
            'io:CoolingRelatedElectricalEnergyConsumptionSensor',
            'io:HeatingRelatedElectricalEnergyConsumptionSensor',
            'io:HeatingElectricalEnergyConsumptionSensor',
            'io:CumulatedElectricalEnergyConsumptionIOSystemDeviceSensor',
        ];
    }

}

module.exports = EnergySensorDriver;
