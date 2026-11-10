import test from 'node:test';
import assert from 'node:assert/strict';
import {counterText, captionRuns} from '../scripts/autopilot-render.mjs';

test('B6 counter shows years/months and never zeroes early', () => {
  assert.equal(counterText({value: 60}), '5 ANOS');
  assert.equal(counterText({value: 59.6}), '5 ANOS');
  assert.equal(counterText({value: 59}), '4A 11M');
  assert.equal(counterText({value: 1}), '1 MÊS');
  assert.equal(counterText({value: 0.5}), '1 MÊS');
  assert.equal(counterText({value: 0}), 'ZEROU');
  assert.equal(counterText({value: 182, unit: 'dias'}), '182 DIAS');
  assert.equal(counterText({text: 'R$ 6.000'}), 'R$ 6.000');
});

test('B6 caption markup colours one keyword', () => {
  assert.deepEqual(captionRuns('QUANDO ELE !ZERA!'), [{text: 'QUANDO ELE ', color: null}, {text: 'ZERA', color: '#ff5a4f'}]);
  assert.deepEqual(captionRuns('*CINCO* ANOS'), [{text: 'CINCO', color: '#ffd23f'}, {text: ' ANOS', color: null}]);
});
