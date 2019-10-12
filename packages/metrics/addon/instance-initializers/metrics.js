function enabled() {
	try {
		if (!window) throw "exception";
		if (!document) throw "exception";
		if (!document.createElement) throw "exception";
		return true;
	} catch (e) {
		return false;
	}
}

export default {

	name: 'metrics',

	initialize(instance) {

		let m = [];

		// Check if browser
		let x = enabled();

		// Get the current environment
		let c = instance.resolveRegistration('config:environment');

		// Prevent lookedup metrics from instantiating
		instance.registerOptionsForType('metric', { instantiate: false });

		[].concat(c.metrics).filter(Boolean).forEach(metric => {

			let n = `metric:${metric.name}`;

			// Does the specified metric exist?
			let f = instance.lookup(n);

			// Should the metric run in this environment?
			let e = metric.environments.includes(c.environment);

			if (x && f && e) {

				let o = f.create(instance.ownerInjection(), {
					name: metric.name, config: metric.config
				});

				instance.register(n, o);
				instance.inject('service:metrics', n, n);

				m.push(o);

			}

		});

		// Register the defined metrics as 'all'
		instance.register('metrics:all', m, { instantiate: false });

		// Push the defined metrics into the service
		instance.inject('service:metrics', 'metrics', 'metrics:all');

	},

}