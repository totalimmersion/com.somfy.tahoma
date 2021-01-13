'use strict';

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the light sensor with the io:TotalElectricalEnergyConsumptionIOSystemSensor, io:TotalElectricalEnergyConsumptionSensor, io:OtherElectricalEnergyConsumptionSensor, io:PlugsElectricalEnergyConsumptionSensor, io:DHWElectricalEnergyConsumptionSensor, io:CoolingRelatedElectricalEnergyConsumptionSensor, io:HeatingRelatedElectricalEnergyConsumptionSensor & io:HeatingElectricalEnergyConsumptionSensor controllable name in TaHoma
 * @extends {Driver}
 */
class EnergySensorDriver extends Driver
{

    async onInit()
    {
        this.deviceType = ['io:TotalElectricalEnergyConsumptionIOSystemSensor', 'io:TotalElectricalEnergyConsumptionSensor', 'io:OtherElectricalEnergyConsumptionSensor', 'io:PlugsElectricalEnergyConsumptionSensor', 'io:DHWElectricalEnergyConsumptionSensor', 'io:CoolingRelatedElectricalEnergyConsumptionSensor', 'io:HeatingRelatedElectricalEnergyConsumptionSensor', 'io:HeatingElectricalEnergyConsumptionSensor'];
    }
}

module.exports = EnergySensorDriver;