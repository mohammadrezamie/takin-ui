import test from 'node:test';
import assert from 'node:assert/strict';
import { placePopover } from './popover.mjs';

const viewport = {x:0,y:0,width:320,height:400};
const anchor = {x:100,y:100,width:50,height:30};
const popup = {width:90,height:80};

test('preferred side and gap are preserved when possible', () => {
    assert.deepEqual(placePopover(anchor,popup,viewport), {
        x:100,y:138,width:90,height:80,side:'bottom',flipped:false,resized:false,shifted:false
    });
});
test('RTL start aligns physical right edge; end aligns left', () => {
    assert.equal(placePopover(anchor,popup,viewport,{direction:'rtl'}).x,60);
    assert.equal(placePopover(anchor,popup,viewport,{direction:'rtl',align:'end'}).x,100);
    assert.equal(placePopover(anchor,popup,viewport,{align:'end'}).x,60);
});
test('center alignment is direction independent', () => {
    for (const direction of ['ltr','rtl']) {
        assert.equal(placePopover(anchor,popup,viewport,{align:'center',direction}).x,80);
    }
});
test('bottom flips above a low anchor', () => {
    const p = placePopover({...anchor,y:350},popup,viewport);
    assert.equal(p.side,'top');
    assert.equal(p.y,262);
    assert.equal(p.flipped,true);
});
test('top flips below a high anchor', () => {
    const p = placePopover({...anchor,y:15},popup,viewport,{side:'top'});
    assert.equal(p.side,'bottom');
    assert.equal(p.y,53);
});
test('top preference remains when both sides fit', () => {
    const p = placePopover({...anchor,y:180},popup,viewport,{side:'top'});
    assert.equal(p.side,'top');
    assert.equal(p.flipped,false);
});
test('cross-axis shift keeps popup inside both edges', () => {
    const right = placePopover({...anchor,x:300},popup,viewport);
    const left = placePopover({...anchor,x:-20},popup,viewport);
    assert.equal(right.x,222);
    assert.equal(left.x,8);
    assert.ok(right.shifted && left.shifted);
});
test('oversized popup is constrained on both axes', () => {
    const p = placePopover(anchor,{width:900,height:900},viewport);
    assert.deepEqual([p.x,p.y,p.width,p.height,p.side,p.resized],[8,138,304,254,'bottom',true]);
});
test('equal available space preserves requested side', () => {
    const a = {x:100,y:185,width:50,height:30};
    for (const side of ['top','bottom']) {
        const p = placePopover(a,{width:90,height:300},viewport,{side});
        assert.equal(p.side,side);
        assert.equal(p.height,169);
    }
});
test('nonzero coordinate origins and custom gap/padding', () => {
    const p = placePopover({x:140,y:120,width:30,height:20},popup,
        {x:100,y:100,width:200,height:250},{gap:4,padding:5});
    assert.equal(p.x,140);
    assert.equal(p.y,144);
});
test('offscreen anchors and impossible placements return null', () => {
    assert.equal(placePopover({...anchor,x:400},popup,viewport),null);
    assert.equal(placePopover({...anchor,y:-100},popup,viewport),null);
    assert.equal(placePopover({x:0,y:0,width:320,height:400},popup,viewport),null);
    assert.equal(placePopover(anchor,popup,viewport,{padding:160}),null);
    assert.equal(placePopover(anchor,{width:0,height:20},viewport),null);
});
test('invalid input fails explicitly', () => {
    for (const a of [null,{...anchor,x:NaN},{...anchor,width:-1},{...anchor,x:Infinity}]) {
        assert.throws(()=>placePopover(a,popup,viewport),TypeError);
    }
    for (const options of [{side:'left'},{align:'auto'},{direction:'auto'},{gap:-1},{padding:NaN}]) {
        assert.throws(()=>placePopover(anchor,popup,viewport,options),TypeError);
    }
});
test('seeded geometry invariant across varied sizes and directions', () => {
    let state = 123456;
    const random = (max) => {
        state = (Math.imul(state,1664525)+1013904223)>>>0;
        return (state%max);
    };
    for (let i=0;i<500;i++) {
        const v = {x:-100+random(200),y:-100+random(200),width:100+random(800),height:100+random(800)};
        const a = {x:v.x+random(v.width),y:v.y+random(v.height),width:random(80),height:random(80)};
        const requested = {width:1+random(1000),height:1+random(1000)};
        const gap = random(20), padding = random(20);
        const p = placePopover(a,requested,v,{gap,padding,direction:i%2?'rtl':'ltr',side:i%2?'top':'bottom'});
        if (!p) continue;
        assert.ok(p.x>=v.x+padding && p.x+p.width<=v.x+v.width-padding);
        assert.ok(p.y>=v.y+padding && p.y+p.height<=v.y+v.height-padding);
        assert.ok(p.width>0 && p.height>0 && p.width<=requested.width && p.height<=requested.height);
        if (p.side==='top') assert.ok(p.y+p.height<=a.y-gap);
        else assert.ok(p.y>=a.y+a.height+gap);
    }
});
