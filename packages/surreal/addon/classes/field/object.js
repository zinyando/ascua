import Property from './property';
import Field from '@ascua/surreal/field';
import { assert } from '@ember/debug';
import { setProperties } from '@ember/object';
import { DestroyedError } from '@ascua/surreal/errors';

export default function(type) {
	return Property({
		get(key) {

			try {

				let model = this.store.lookup(type);

				if (model && model.class.prototype instanceof Field) {
					return this.data[key] = this.data[key] || model.create({ parent: this });
				}

				assert('An embedded object must be of type Field');

			} catch (e) {

				if (e instanceof DestroyedError) {
					// ignore
				} else {
					throw e;
				}

			}

		},
		set(key, value={}) {

			try {

				let model = this.store.lookup(type);

				if (model && model.class.prototype instanceof Field) {
					switch (true) {
					case this.data[key] !== undefined:
						setProperties(this.data[key], value);
						return this.data[key];
					case this.data[key] === undefined:
						return this.data[key] = model.create({ ...value, parent: this });
					}
				}

				assert('An embedded object must be of type Field');

			} catch (e) {

				if (e instanceof DestroyedError) {
					// ignore
				} else {
					throw e;
				}

			}

		},
	});
}
