/**
 * Module with generic helper functions
 * @module GenericHelper
 * @example
 * const genericHelper = require('./lib/helper').Generic;
 **/

/**
 * Checks if the argument is a function
 * @name isFunction
 * @function
 * @public
 * @param {Object} obj - Object to check if it is a function
 * @returns {boolean}
 */
const isFunction = obj => !!(obj && obj.constructor && obj.call && obj.apply);

/**
 * Transforms an object to an array
 * @name objToArray
 * @function
 * @public
 * @param {Object} obj - Object to transform to array
 * @returns {Array}
 */
const objToArray = (obj) => {
	if (isFunction(obj)) throw new TypeError('obj is not a function');
	return Object.values(obj);
};

/**
 * Returns the last item in an array
 * @name getLastItemFrom
 * @function
 * @public
 * @param {Array} array - array to get the last item from
 * @returns {Object}
 */
const getLastItemFrom = array => {
	if (!Array.isArray(array)) throw new TypeError('argument is not an array');
	return array.slice().pop();
};

/**
 * Creates a new function which executes the given functions where each function's return value is the next one's input
 * @name pipe
 * @function
 * @public
 * @example
 * const add = x => x+1;
 * const dbl = x => x*2;
 * const addThenDbl = genericHelper.pipe(add, dbl);
 * const result = addThenDbl(2); // result = 6
 * @param {Array} fns - Array of function to create the pipe from
 * @returns {Function}
 */
const pipe = (...fns) => fns.reduce((a, b) => x => b(a(x)));


const stackPattern = /(\(.+:[0-9]+:[0-9]+\))/g;
/**
 * Logs given label, value and file + linenumber (where the trace function is invoked) to the console
 * @function
 * @public
 * @example
 * const value = genericHelper.trace('label')('value');
 * @param {string} label - the label for the value
 * @returns {Function} functions which accepts the value to log as an argument
 */
const trace = label => value => {
	let stack = '';
	try {
		throw new Error();
	} catch(error) {
		stack = error.stack.match(stackPattern)[1];
	}
	console.log(`${label}: ${value} ${stack}`);
	return value;
};

module.exports = {
	isFunction,
	objToArray,
	getLastItemFrom,
	pipe,
	trace
};
