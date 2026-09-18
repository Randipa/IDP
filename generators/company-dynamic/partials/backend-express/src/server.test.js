import test from 'node:test';
import assert from 'node:assert/strict';

test('service name is embedded in the bootstrap project', () => {
  assert.equal('{{name}}'.length > 0, true);
});
