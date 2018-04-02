const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const genericHelper = require('./generic');
const deviceHelper = require('./device');

describe('Device helper', function() {

	describe('isSameDevice', function() {
		const correctId = 'abc';
		const wrongId = 'def';

		const device = {
			oid: 'abc'
		}

		const invalidObj = {
			id: 'abc'
		}

		it('does have the same id', function() {
			expect(deviceHelper.isSameDevice(correctId)(device)).to.be.true;
		});

		it('does not have the same id', function() {
			expect(deviceHelper.isSameDevice(wrongId)(device)).to.be.false;
			expect(deviceHelper.isSameDevice(correctId)(invalidObj)).to.be.false;
			expect(deviceHelper.isSameDevice(wrongId)(invalidObj)).to.be.false;
			expect(deviceHelper.isSameDevice()(device)).to.be.false;
			expect(deviceHelper.isSameDevice(correctId)()).to.be.false;
			expect(deviceHelper.isSameDevice()()).to.be.false;
		});
	});

	describe('sync', function() {
		it('returns a function', function() {
			expect(deviceHelper.sync([])).to.be.a('function');
		});

		it('throws an error if the argument is not an array', function() {
			expect(() => deviceHelper.sync()).to.throw(TypeError);
			expect(() => deviceHelper.sync({})).to.throw(TypeError);
			expect(() => deviceHelper.sync('string')).to.throw(TypeError);
		});

		it('calls sync() on all devices', function() {
			const sync = sinon.spy();

			const device = {
				sync: sync
			}

			const devices = [ device, device, device ];

			deviceHelper.sync(devices)('data');
			expect(sync).to.have.callCount(3);
		});

		it('throws an error if the device does not have a sync method', function() {
			const device = {};
			const devices = [ device ];
			expect(() => deviceHelper.sync(devices)('data')).to.throw(TypeError);
		});
	});
});