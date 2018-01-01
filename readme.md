### vent

### v1.0.1

#### We follow [breaking].[feature].[fix] versioning

`npm install --save @krab/vent`

This module provides a simple-to-use and context-aware event-aggregator.
Usage given below:

##### Importing
```js
import Vent from '@krab/vent'; // in projects with ES7 modules
const Vent = require('@krab/vent/common'); // in projects with common JS modules

const vent = new Vent();

```

##### Basic Usage
```js
const fooListener = () => console.log('foo');

vent.on('foo', fooListener); // attaches 'fooListener' to event 'foo'
vent.emit('foo'); // emits 'foo' and runs all attached listeners
vent.off('foo'); // removes all listeners attached to event 'foo'
vent.off('foo', fooListener); // removes 'fooListener' from event 'foo'

```

##### Once Listener
```js
const onceListener = () => {
  if (onceListener.hasRun) {
    throw new Error('onceListener has run');
  }

  onceListener.hasRun = true;
};
onceListener.hasRun = false;

vent.once('once', onceListener); // 'onceListener' will be run only once for event 'once'
vent.emit('once'); // 'onceListener' will run and will be removed
vent.emit('once'); // 'onceListener' won't run again
```

##### Context Awareness

Event listeners can also be registered in context of an object. This gives us more control over the listeners.
```js
const foo = () => console.log('foo');
const bar = () => console.log('bar');
const baz = () => console.log('baz');

const ctx = {};

vent.on('foo', foo, ctx);
vent.on('bar', bar, ctx);
vent.once('baz', baz, ctx);

vent.emit('foo'); // will run listener 'foo'
vent.off('foo', foo, ctx); // will remove listener 'foo' from the event for context 'ctx'
vent.off('foo', ctx); // will remove all listeners for event 'foo' for context 'ctx'

vent.off(ctx); // will remove all listeners for context 'ctx'
```
