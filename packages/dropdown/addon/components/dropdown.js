import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class extends Component {

	@tracked top = 0;

	@tracked left = 0;

	@tracked options = [];

	@tracked selected = [];

	@tracked display = false;

	@tracked visible = false;

	@action open() {
		this.display = true;
		setTimeout( () => {
			this.style();
		});
	}

	@action close() {
		this.display = false;
		this.visible = false;
	}

	@action didCreate(element) {
		this.element = element;
	}

	@action register(el, value, label) {
		this.options.addObject({
			el, label, value
		});
	}

	@action unregister(el, value, label) {
		this.options = this.options.filter(opt => {
			return opt.el !== el;
		});
	}

	@action reregister(el, value, label) {
		this.options = this.options.map(opt => {
			return opt.el !== el ? opt : {
				el, label, value
			};
		});
	}

	@action changed(value) {

		if (this.args.multiple) {
			if ( [].concat(this.args.value).includes(value) ) {
				value = [].concat(this.args.value).removeObject(value);
			} else {
				value = [].concat(this.args.value).addObject(value);
			}
		}

		if (this.args.onSelect) {
			this.args.onSelect(value);
		}

		this.close();

	}

	style() {

		let f = this.element.children[2];
		let w = this.element.children[2].offsetWidth;
		let h = this.element.children[2].offsetHeight;
		let t = this.element.children[0].getBoundingClientRect().top - 5;
		let l = this.element.children[0].getBoundingClientRect().left - 5;

		let [ x, y ] = [ -10, -30 ];

		while ( l+w > window.innerWidth-30 ) {
			l--; x--;
		}

		while ( t+h > window.innerHeight-30 ) {
			t--; y--;
		}

		this.top = y;
		this.left = x;
		this.visible = true;

	}

	get value() {
		return this.args.value;
	}

	get label() {

		let value = [].concat(this.args.value);

		let label = this.options.reduce( (a, o, k) => {

			if ( value.includes(o.value) ) {
				if (o.label) {
					a.push(o.label);
				} else {
					a.push(o.el.innerHTML);
				}
			}

			return a;

		}, []);

		return label.join(', ');

	}

}
