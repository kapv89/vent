import assert from 'assert';
import {range} from 'lodash';

import Vent from '../src';

function run() {
  const vent = new Vent();

  assert.ok(vent instanceof Vent);

  const newTrackingListener = () => {
    const listener = (...args) => {
      listener.runs.push(args);
    };
    listener.runs = [];

    return listener;
  };

  (() => {
    console.log('testing vent.on, vent.once, vent.emit, vent.off');

    const listener = newTrackingListener();
    const onceListener = newTrackingListener();

    vent.on('one', listener);
    vent.on('two', listener);
    vent.on('once', onceListener);

    vent.emit('one');
    assert.ok(listener.runs.length === 1);
    assert.ok(listener.runs[0].length === 0);
    vent.off('one');
    vent.emit('one');
    assert.ok(listener.runs.length === 1);

    const argsOne = [1, 2, 3];
    vent.emit('two', ...argsOne);
    assert.ok(listener.runs.length === 2);
    assert.ok(listener.runs[1].reduce((ok, arg, i) => {
      return ok && argsOne[i] === arg;
    }, true));
    vent.off('two');
    vent.emit('two');
    assert.ok(listener.runs.length === 2);

    vent.emit('once');
    assert.ok(onceListener.runs.length === 1);
    vent.emit('once');
  })();

  (() => {
    console.log('testing vent.on, vent.emit, vent.off with context');

    const [
      listenerOne,
      listenerTwo,
      listenerThree
    ] = range(0, 3).map(() => newTrackingListener());

    const ctx = {};

    vent.on('one', listenerOne, ctx);
    vent.on('two', listenerTwo, ctx);
    vent.on('three', listenerThree, ctx);

    vent.emit('one', 1, 2);
    assert.ok(listenerOne.runs.length === 1);
    assert.ok(listenerOne.runs[0].length === 2);

    vent.emit('two', 1, 2);
    assert.ok(listenerTwo.runs.length === 1);
    assert.ok(listenerTwo.runs[0].length === 2);

    vent.emit('three', 1, 2);
    assert.ok(listenerThree.runs.length === 1);
    assert.ok(listenerThree.runs[0].length === 2);

    vent.off(ctx);

    vent.emit('one');
    assert.ok(listenerOne.runs.length === 1);

    vent.emit('two');
    assert.ok(listenerOne.runs.length === 1);

    vent.emit('three');
    assert.ok(listenerOne.runs.length === 1);
  })();
}

if (require.main === module) {
  run();
}
