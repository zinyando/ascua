import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { action } from '@ember/object';
import Item from '../classes/item';

export default class extends Component {

	@tracked total = 0;

	@tracked model = [];

	@tracked items = [];

	conf = {
		@tracked h: 0, // view height
		@tracked a: [], // active selection
		@tracked k: this.args.colWidth ? 'g' : 'l',
		v: { @tracked c: 0, @tracked r: 0 }, // visible items
		e: { @tracked w: 0, @tracked h: 0 }, // view dimensions
		i: { @tracked w: 0, @tracked h: 0 }, // item dimensions
		s: { @tracked l: 0, @tracked t: 0 }, // scroll positions
	};

	@action exit() {
		if (this.model !== this.args.model) return false;
		if (this.total !== this.args.model.length) return false;
		return true;
	}

	@action didInsert(element) {
		if (this.exit()) return;
		this.model = this.args.model;
		this.total = this.model.length;
		this.conf.e.w = element.clientWidth;
		this.conf.e.h = element.clientHeight;
		this.conf.i.w = parseInt(this.args.colWidth);
		this.conf.i.h = parseInt(this.args.rowHeight);
		this.setup(true);
	}

	@action didUpdate(element) {
		if (this.exit()) return;
		this.model = this.args.model;
		this.total = this.model.length;
		this.conf.e.w = element.clientWidth;
		this.conf.e.h = element.clientHeight;
		this.conf.i.w = parseInt(this.args.colWidth);
		this.conf.i.h = parseInt(this.args.rowHeight);
		this.setup(true);
	}

	@action didResize(element) {
		this.conf.e.w = element.clientWidth;
		this.conf.e.h = element.clientHeight;
		this.setup(true);
	}

	@action didScroll(element) {
		this.conf.s.t = element.target.scrollTop;
		this.conf.s.l = element.target.scrollLeft;
		this.setup(false);
	}

	setup(force = false) {

		// Total items
		let colW = this.conf.i.w;
		let rowH = this.conf.i.h;

		// Total visible columns
		let cols = 1;
		cols = colW ? Math.floor( this.conf.e.w / colW ) : cols;
		cols = colW ? Math.max(1, cols) : cols;
		this.conf.v.c = cols;

		// Total visible rows
		let rows = 1;
		rows = rowH ? Math.ceil( this.conf.e.h / rowH ) + 1 : rows;
		rows = rowH ? Math.max(1, rows) : rows;
		this.conf.v.r = rows;

		// Total div scrollheight
		this.conf.h = Math.ceil(this.total / cols) * rowH;

		// Number of beginning item
		let brw = Math.floor( this.conf.s.t / rowH );

		// Number of finishing item
		let frw = Math.floor( brw + ( rows - 1 ) ) + 1;

		// Index of beginning item
		this.bix = Math.min(this.total, brw * cols) || 0;

		// Index of finishing item
		this.fix = Math.min(this.total, frw * cols) || 0;

		// Check if we have scrolled
		if (this.cix == this.bix && force === false) return;

		// Set current start index
		this.cix = this.bix;

		// Difference of ids
		let sub = this.fix - this.bix;

		// Difference of rows
		let dif = sub - this.items.length;

		// Remove any extra item placeholders
		if (dif < 0) {
			for ( let i = 0; i > dif; --i ) {
				this.items.popObject();
			}
		}

		// Add necessary item placeholders
		if (dif > 0) {
			for ( let i = 0; i < dif; i++ ) {
				this.items.pushObject( new Item() );
			}
		}

		// Array of ids for rows to be loaded
		let ids = Array(sub).fill().map( (v, k) => k + this.bix );

		// Change placeholder content
		ids.forEach(i => {
			let pos = i % sub;
			let obj = this.items.objectAt(pos);
			obj.index = i;
			obj.model = [].concat(this.args.model).objectAt(i, false);
		});

		// Cancel all remote fetches
		clearTimeout(this.timer);

		// Fetch and change placeholder content
		this.timer = setTimeout( () => {
			ids.forEach(i => {
				let pos = i % sub;
				let obj = this.items.objectAt(pos);
				obj.index = i;
				obj.model = [].concat(this.args.model).objectAt(i, true);
			});
		}, 500);

	}

	@action select(item, options) {

		if (options.toggle) {
			if (this.conf.a.includes(item.id)) {
				this.conf.a.removeObject(item.id);
			} else {
				this.conf.a.addObject(item.id);
			}
		}

		if (options.range) {
			// let idx = range(item.index, this.cursor);
			// this.conf.a.addObjects(idx);
		}

		if (options.single) {
			this.conf.a.clear();
			this.conf.a.addObject(item.id);
		}

		if (options.reset) {
			this.conf.a.clear();
		}

		this.cursor = item ? item.index : null;

		if (this.args.onSelect) {
			this.args.onSelect(this.conf.a, item.model);
		}

	}

	@action didClick(event, item) {

		if (event.shiftKey) {
			this.select(item, { range: true });
		}

		if (event.metaKey || event.altKey) {
			this.select(item, { toggle: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			this.select(item, { single: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			if (this.args.onClick) {
				return this.args.onClick(item.model);
			}
		}

	}

	@action dblClick(event, item) {

		if (event.shiftKey) {
			this.select(item, { range: true });
		}

		if (event.metaKey || event.altKey) {
			this.select(item, { toggle: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			this.select(item, { single: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			if (this.args.onDblClick) {
				return this.args.onDblClick(item.model);
			}
		}

	}

	@action ctxClick(event, item) {

		this.select(item, { single: true });

		if (this.args.onContextMenu) {
			return this.args.onContextMenu(event, item.model);
		}

	}

}
