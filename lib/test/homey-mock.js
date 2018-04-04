const Homey = {
	SimpleClass: class SimpleClass {},
	Device: class Device {
		getData() {
			return {
				id: ''
			}
		}

		setUnavailable() {}
	}
}

module.exports = Homey;