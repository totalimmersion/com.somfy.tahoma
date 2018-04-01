const expect = require('chai').expect;

const driverHelper = require('./driver');

describe('Driver helper', () => {
	
	const drivers = {
		driver1: {
			name: 'driver 1'
		},
		driver2: {
			name: 'driver 2'
		}
	}

	it('transforms an object to an array', () => {
		expect(driverHelper.getDriversAsArray(drivers)).to.be.an('array');
		expect(driverHelper.getDriversAsArray(drivers)).to.deep.equal([{ name: 'driver 1' }, { name: 'driver 2' }]);
	});

	it('does not alter an array as input', () => {
		expect(driverHelper.getDriversAsArray(['a', 'b', 'c'])).to.deep.equal(['a', 'b', 'c']);
	});

});