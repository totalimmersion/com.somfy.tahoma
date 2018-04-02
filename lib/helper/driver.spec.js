const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const genericHelper = require('./generic');
const driverHelper = require('./driver');

const deviceHelper = require('./device');

beforeEach(function () {
	this.sandbox = sinon.sandbox.create()
	this.sandbox.sync = sinon.spy()/*() => {
		console.log('sync...');
	};*/

	const device = {
		name: 'device',
		sync: this.sandbox.sync
	}

	const driver = {
		getDevices: function() {
			return [device, device, device];
		}
	}

	this.sandbox.drivers = {
		driver1: driver,
		driver2: driver,
		driver3: driver
	};
});

afterEach(function () {
	this.sandbox.restore()
});

describe('Driver helper', function() {

	describe('getDevices', function() {
		it('gets all devices in a flat array', function() {
			const expectedResult = [
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync },
				{ name: 'device', sync: this.sandbox.sync }
			];
			const driversArray = genericHelper.objToArray(this.sandbox.drivers);
			expect(driverHelper.getDevices(driversArray)).to.be.an('array');
			expect(driverHelper.getDevices(driversArray).length).to.equal(9);
			expect(driverHelper.getDevices(driversArray)).to.deep.equal(expectedResult);
		});
	});

	describe('syncAll', function() {
		it('calls sync() on all devices', function() {
			driverHelper.syncAll(this.sandbox.drivers)('data');
			expect(this.sandbox.sync).to.have.callCount(9);
		});
	});
});