import test from 'node:test';
import assert from 'node:assert/strict';
import { direction, logicalSide, physicalSide } from './direction.mjs';

test('Persian, Arabic, Hebrew and English locale tags', () => {
    for (const locale of ['fa', 'fa_IR', 'ar-SA', 'he-IL', 'ur']) assert.equal(direction(locale), 'rtl');
    for (const locale of ['en', 'de', 'zh-Hans']) assert.equal(direction(locale), 'ltr');
});
test('explicit script and invalid input', () => {
    assert.equal(direction('az-Arab'), 'rtl');
    assert.equal(direction('fa-Latn'), 'ltr');
    for (const locale of [null, 5, '', '!!!']) assert.equal(direction(locale), 'ltr');
});
test('logical side and direction', () => {
    for (const [side, dir, expected] of [['start','ltr','left'],['end','ltr','right'],['start','rtl','right'],['end','rtl','left']]) {
        assert.equal(logicalSide(side, dir), expected);
    }
    assert.throws(() => logicalSide('top', 'rtl'), TypeError);
    assert.throws(() => logicalSide('start', 'auto'), TypeError);
});
test('horizontal writing mode maps block and inline axes', () => {
    assert.deepEqual(['block-start','block-end','inline-start','inline-end'].map(side => physicalSide(side, 'ltr')),
        ['top','bottom','left','right']);
    assert.deepEqual(['block-start','block-end','inline-start','inline-end'].map(side => physicalSide(side, 'rtl')),
        ['top','bottom','right','left']);
});
test('vertical-rl writing mode maps block progression right to left', () => {
    assert.deepEqual(['block-start','block-end','inline-start','inline-end'].map(side => physicalSide(side, 'ltr', 'vertical-rl')),
        ['right','left','top','bottom']);
    assert.deepEqual(['block-start','block-end','inline-start','inline-end'].map(side => physicalSide(side, 'rtl', 'vertical-rl')),
        ['right','left','bottom','top']);
});
test('vertical-lr writing mode maps block progression left to right', () => {
    assert.deepEqual(['block-start','block-end','inline-start','inline-end'].map(side => physicalSide(side, 'ltr', 'vertical-lr')),
        ['left','right','top','bottom']);
    assert.deepEqual(['block-start','block-end','inline-start','inline-end'].map(side => physicalSide(side, 'rtl', 'vertical-lr')),
        ['left','right','bottom','top']);
});
test('invalid logical edges, direction and unsupported writing modes fail closed', () => {
    for (const args of [['top','ltr'], ['inline-start','auto'], ['block-end','rtl','sideways-rl']]) {
        assert.throws(() => physicalSide(...args), TypeError);
    }
});
