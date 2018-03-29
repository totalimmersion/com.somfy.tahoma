const expect = require('chai').expect;
const sinon = require('sinon');
const mock = require('mock-require');

const Homey = {
	SimpleClass: class SimpleClass {}
}

mock('homey', Homey);

const Tahoma = require('./Tahoma');

beforeEach(() => {
});

describe('Tahoma client', () => {

	it('has a login method', () => {
		expect(Tahoma.login).to.be.a('function');
	});

	it('makes a login request', (done) => {
		Tahoma.login('username', 'password')
			.then(result => {
				expect(result).to.be.json;
				done();
			})
			.catch(error => {
				expect(error).to.be.null;
				done();
			});
	})
});