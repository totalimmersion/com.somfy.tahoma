
module.exports.getLastItemFrom = array => array.slice().pop();

module.exports.pipe = (...fns) => fns.reduce((a, b) => x => b(a(x)));