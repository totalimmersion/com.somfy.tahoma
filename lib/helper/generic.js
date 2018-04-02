const isFunction = obj => !!(obj && obj.constructor && obj.call && obj.apply);

const objToArray = (obj) => {
	if (isFunction(obj)) throw new TypeError('obj is not a function');
	return Object.values(obj);
}

const getLastItemFrom = array => {
	if (!Array.isArray(array)) throw new TypeError('argument is not an array');
	return array.slice().pop();
}

const pipe = (...fns) => fns.reduce((a, b) => x => b(a(x)));

const stackPattern = /(\(.+:[0-9]+:[0-9]+\))/g;
const trace = label => value => {
	let stack = '';
	try {
		throw new Error();
	} catch(error) {
		stack = error.stack.match(stackPattern)[1];
	}
	console.log(`${label}: ${value} ${stack}`);
	return value;
}

module.exports.isFunction = isFunction;
module.exports.objToArray = objToArray;
module.exports.getLastItemFrom = getLastItemFrom;
module.exports.pipe = pipe;
module.exports.trace = trace;