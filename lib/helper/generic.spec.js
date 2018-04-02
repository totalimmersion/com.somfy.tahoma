const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const genericHelper = require('./generic');

describe('Generic helper', function() {

	describe('isFunction', function() {
		it('checks if an argument is a function', function() {
			expect(genericHelper.isFunction(function() {})).to.be.true;
			expect(genericHelper.isFunction(new Function())).to.be.true;
			expect(genericHelper.isFunction({})).to.be.false;
			expect(genericHelper.isFunction()).to.be.false;
		});
	})

	describe('objToArray', function() {
		it('transforms an object to an array and preserves the original object', function() {
			const obj = {
				obj1: {
					name: 'obj 1'
				},
				obj2: {
					name: 'obj 2'
				}
			}

			expect(genericHelper.objToArray(obj)).to.be.an('array');
			expect(genericHelper.objToArray(obj)).to.deep.equal([{ name: 'obj 1' }, { name: 'obj 2' }]);
			expect(obj).to.deep.equal({
				obj1: {
					name: 'obj 1'
				},
				obj2: {
					name: 'obj 2'
				}
			});
		});

		it('does transform a string into an array', function() {
			expect(genericHelper.objToArray('string')).to.deep.equal(['s', 't', 'r', 'i', 'n', 'g']);
		});

		it('throws an error when a function is passed as an argument', function() {
			const fn = function() {};
			expect(() => genericHelper.objToArray(fn)).to.throw(TypeError);
		});
	});

	describe('getLastItemFrom', function() {
		it('returns the last element from an array', function() {
			const arr = ['a', 'b', 'c'];
			expect(genericHelper.getLastItemFrom(arr)).to.equal('c');
		});

		it('throws an error when the argument isn\'t an array', function() {
			expect(() => genericHelper.getLastItemFrom({})).to.throw(TypeError);
		});

		it('does not alter the original array', function() {
			const arr = ['a', 'b', 'c'];
			genericHelper.getLastItemFrom(arr);
			expect(arr).to.deep.equal(['a', 'b', 'c']);
		})
	});

	describe('pipe', function() {
		const inc = x => x+1;
		const dbl = x => x*2;
		const sqr = x => x*x;
		it('returns a function', function() {
			expect(genericHelper.pipe(inc, dbl)).to.be.a('function');
		});

		it('pipes multiple functions into one', function() {
			expect(inc(1)).to.equal(2);
			expect(dbl(2)).to.equal(4);
			expect(sqr(4)).to.equal(16);
			const incThenDblThenSqr = genericHelper.pipe(inc, dbl, sqr);
			expect(incThenDblThenSqr(1)).to.equal(16);
		});
	});

	describe('trace', function() {
		it('returns a function', function() {
			expect(genericHelper.trace('label')).to.be.a('function');
		});
		it('returns the value given', function() {
			const consoleStub = sinon.stub(console, "log");
			expect(genericHelper.trace('label')('value')).to.equal('value');
			consoleStub.restore();
		});
		it('invokes console.log', function() {
			const consoleStub = sinon.stub(console, "log");
			genericHelper.trace('label')('value');
			expect(consoleStub).to.be.called;
			consoleStub.restore();
		});
	});

});