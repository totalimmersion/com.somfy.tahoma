module.exports.isSameDevice = id => device => {
	if (id == undefined && device == undefined) return false;
	device = device || {};
	return id == device.oid;
}

module.exports.sync = devices => {
	if (!Array.isArray(devices)) throw new TypeError('devices is not an array');
	return data => devices.map(device => device.sync(data));
}