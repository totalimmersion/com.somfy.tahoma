const genericHelper = require('./generic');
const deviceHelper = require('./device');

const getDriversAsArray = (driversObj) => Object.values(driversObj);
const getDevices = drivers => drivers.map(driver => driver.getDevices()).reduce((acc, x) => acc.concat(x) , []);
const syncAll = genericHelper.pipe(getDriversAsArray, getDevices, deviceHelper.sync);

module.exports.getDriversAsArray = getDriversAsArray;
module.exports.getDevices = getDevices;
module.exports.syncAll = syncAll;