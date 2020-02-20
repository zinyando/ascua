'use strict';

module.exports = {

	name: require('./package').name,

	included(app) {

		this._super.included(...arguments);

		app.import('node_modules/sortablejs/Sortable.min.js');

		app.import('vendor/sortable.js', {
			exports: { sortable: ['default'] }
		});

	},

};