module.exports.isSameDevice = id => device => id == device.oid;

module.exports.sync = devices => data => devices.map(device => device.sync(data));