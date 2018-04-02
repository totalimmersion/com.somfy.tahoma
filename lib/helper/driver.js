const genericHelper = require('./generic');
const deviceHelper = require('./device');

const getDevices = drivers => drivers.map(driver => driver.getDevices()).reduce((acc, x) => acc.concat(x) , []);
const syncAll = genericHelper.pipe(genericHelper.objToArray, getDevices, deviceHelper.sync);

module.exports.getDevices = getDevices;
module.exports.syncAll = syncAll;