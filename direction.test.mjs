import test from 'node:test';
import assert from 'node:assert/strict';
import { direction, logicalSide } from './direction.mjs';

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
