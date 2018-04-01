const getLastItemFrom = array => array.slice().pop();

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

module.exports.getLastItemFrom = getLastItemFrom;
module.exports.pipe = pipe;
module.exports.trace = trace;