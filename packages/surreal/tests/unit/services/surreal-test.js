import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { WebSocket as MockWebSocket, Server as MockServer } from 'mock-socket';

const { keys } = Object;

module('Unit | Service | Surreal', function (hooks) {
	setupTest(hooks);

	test('that calling socketFor will correctly create a connection', function (assert) {
		const service = this.owner.lookup('service:websockets');
		const server = new MockServer('ws://example.com:7000/');

		service.socketFor('ws://example.com:7000/');

		assert.strictEqual(keys(service.get('sockets')).length, 1);
		assert.strictEqual(
			keys(service.get('sockets'))[0],
			'ws://examplecom:7000/'
		);

		server.stop();
	});
});
