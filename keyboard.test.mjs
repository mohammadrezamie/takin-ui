import test from 'node:test';
import assert from 'node:assert/strict';
import { nextFocus } from './keyboard.mjs';

const items = [{id:'a'}, {id:'b',disabled:true}, {id:'c'}, {id:'d'}];

test('horizontal LTR skips disabled entries', () => {
    assert.deepEqual(nextFocus(items,'a','ArrowRight'), {handled:true,id:'c'});
    assert.deepEqual(nextFocus(items,'c','ArrowLeft'), {handled:true,id:'a'});
});
test('horizontal RTL reverses arrow meaning', () => {
    assert.deepEqual(nextFocus(items,'a','ArrowLeft',{direction:'rtl'}), {handled:true,id:'c'});
    assert.deepEqual(nextFocus(items,'c','ArrowRight',{direction:'rtl'}), {handled:true,id:'a'});
});
test('vertical arrows are independent of text direction', () => {
    for (const direction of ['ltr','rtl']) {
        assert.deepEqual(nextFocus(items,'c','ArrowUp',{orientation:'vertical',direction}), {handled:true,id:'a'});
        assert.deepEqual(nextFocus(items,'c','ArrowDown',{orientation:'vertical',direction}), {handled:true,id:'d'});
    }
});
test('Home and End choose enabled endpoints', () => {
    const entries = [{id:'first',disabled:true}, ...items, {id:'last',disabled:true}];
    assert.deepEqual(nextFocus(entries,'c','Home'), {handled:true,id:'a'});
    assert.deepEqual(nextFocus(entries,'c','End'), {handled:true,id:'d'});
});
test('bounded navigation preserves current focus at an edge', () => {
    assert.deepEqual(nextFocus(items,'a','ArrowLeft'), {handled:true,id:'a'});
    assert.deepEqual(nextFocus(items,'d','ArrowRight'), {handled:true,id:'d'});
});
test('optional wrap works in both directions', () => {
    assert.deepEqual(nextFocus(items,'d','ArrowRight',{wrap:true}), {handled:true,id:'a'});
    assert.deepEqual(nextFocus(items,'a','ArrowLeft',{wrap:true}), {handled:true,id:'d'});
});
test('null current establishes first or last enabled focus', () => {
    for (const wrap of [true,false]) {
        assert.deepEqual(nextFocus(items,null,'ArrowRight',{wrap}), {handled:true,id:'a'});
        assert.deepEqual(nextFocus(items,null,'ArrowLeft',{wrap}), {handled:true,id:'d'});
    }
});
test('disabled current can navigate to an enabled neighbor', () => {
    assert.deepEqual(nextFocus(items,'b','ArrowRight'), {handled:true,id:'c'});
    assert.deepEqual(nextFocus(items,'b','ArrowLeft'), {handled:true,id:'a'});
});
test('unrelated keys are never consumed', () => {
    for (const key of ['Tab','Escape','Enter',' ','ArrowDown']) {
        assert.deepEqual(nextFocus(items,'c',key), {handled:false,id:'c'});
    }
});
test('empty and all-disabled collections do not consume keys', () => {
    assert.deepEqual(nextFocus([],null,'Home'), {handled:false,id:null});
    assert.deepEqual(nextFocus([{id:'a',disabled:true}],'a','ArrowRight'), {handled:false,id:'a'});
});
test('single enabled item is stable with wrapping', () => {
    assert.deepEqual(nextFocus([{id:'a'}],'a','ArrowLeft',{wrap:true}), {handled:true,id:'a'});
});
test('invalid input rejects duplicate IDs, invalid options and unknown current', () => {
    assert.throws(()=>nextFocus([{id:'a'},{id:'a'}],null,'Home'), TypeError);
    assert.throws(()=>nextFocus([{id:'a',disabled:'false'}],null,'Home'), TypeError);
    assert.throws(()=>nextFocus(items,'missing','Home'), TypeError);
    for (const options of [{orientation:'grid'},{direction:'auto'},{wrap:1}]) {
        assert.throws(()=>nextFocus(items,'a','Home',options), TypeError);
    }
});
