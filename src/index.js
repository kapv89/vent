import {isString, isFunction, isArray, isUndefined} from 'lodash';

export default class Vent {
  // a nested map to track things from context to listener
  contextListenerEventsMap = new Map();

  // a default context when no context is provided
  defaultContext = {};

  on(...args) {
    switch (args.length) {
    case 0:
    case 1: throw new Error('invalid args');
    case 2: return this.on(...args, this.defaultContext);
    default:
      const [ev, listener, context] = args;

      if (isArray(ev)) {
        ev.forEach((event) => this.on(event, listener, context));
        return this;
      }

      if (!this.contextListenerEventsMap.has(context)) {
        this.contextListenerEventsMap.set(context, new Map());
      }

      if (!this.contextListenerEventsMap.get(context).has(listener)) {
        this.contextListenerEventsMap.get(context).set(listener, new Set());
      }

      if (!this.contextListenerEventsMap.get(context).get(listener).has(ev)) {
        this.contextListenerEventsMap.get(context).get(listener).add(ev);
      }

      return this;
    }
  }

  once(...args) {
    const [ev, listener, context] = args.length === 2 ? [...args, this.defaultContext] : args;

    if (isArray(ev)) {
      ev.forEach((event) => this.once(event, listener, context));
      return this;
    } else {
      const onceListener = () => {
        listener.bind(context)(...args);
        this.off(ev, onceListener, context);
      };

      return this.on(ev, onceListener, context);
    }
  }

  off(...args) {
    switch (args.length) {
    case 0: throw new Error('invalid args');
    case 1:
      if (isString(args[0])) {
        // all listeners being removed for an event
        const [ev] = args;
        this.removeAllEventOccurences(ev);
      } else if (isFunction(args[0])) {
        // a listener being removed from all relevant events
        const [listener] = args;
        this.removeAllListenerOccurences(listener);
      } else {
        // all listener for a context being removed
        const [context] = args;
        this.removeAllContextOccurences(context);
      }

      return this;

    case 2:
      // only 2 variations expected, [ev, listener] and [ev, context]
      if (isFunction(args[1])) {
        // [ev, listener]
        const [ev, listener] = args;
        this.removeEventForListener(ev, listener);
      } else {
        // [ev, context]
        const [ev, context] = args;
        this.removeEventForContext(ev, context);
      }

      return this;

    default:
      // [ev, listener, context]
      const [ev, listener, context] = args;
      this.removeEventForListenerAndContext(ev, listener, context);
      return this;
    }
  }

  emit(ctx, ev, ...args) {
    if (isString(ctx)) {
      [ctx, ev, args] = [this.defaultContext, ctx, isUndefined(ev) ? [] : [ev, ...args]];
    }

    this.getListenerContextTuplesForEvent(ev).forEach(([listener, context]) => {
      if (context === ctx) {
        listener.bind(context)(...args);
      }
    });
    return this;
  }

  getEventsForListener(listener) {
    return Array.from(this.contextListenerEventsMap.entries())
      .filter((listenerEventsMap) => listenerEventsMap instanceof Map && listenerEventsMap.has(listener))
      .map((listenerEventsMap) => Array.from(listenerEventsMap.get(listener).values()))
      .reduce((allEvents, listenerEvents) => allEvents.concat(listenerEvents), [])
      .reduce((events, ev) => events.concat([ev]), [])
    ;
  }

  getListenerEventTuplesForContext(context) {
    if (!this.contextListenerEventsMap.has(context)) {
      return [];
    } else {
      return Array.from(this.contextListenerEventsMap.get(context).entries())
        .map(([listener, listenerEventsMap]) => {
          if (!(listenerEventsMap instanceof Map)) {
            return [];
          }

          return Array.from(listenerEventsMap.get(listener).values())
            .map((ev) => [listener, ev])
          ;
        })
        .reduce((allTuples, listenerTuples) => allTuples.concat(listenerTuples), [])
      ;
    }
  }

  getListenerContextTuplesForEvent(ev) {
    return Array.from(this.contextListenerEventsMap.entries())
      .map(([context, listenerEventsMap]) => {
        if (!(listenerEventsMap instanceof Map)) {
          return [];
        }

        return Array.from(listenerEventsMap.entries())
          .filter(([, events]) => events.has(ev))
          .map(([listener]) => [listener, context]);
      })
      .reduce((all, listenerContextTuples) => all.concat(listenerContextTuples), [])
    ;
  }

  removeAllEventOccurences(ev) {
    Array.from(this.contextListenerEventsMap.entries()).forEach(([context, listenerEventsMap]) => {
      if (!(listenerEventsMap instanceof Map)) {
        return;
      }

      Array.from(listenerEventsMap.entries()).forEach(([listener, events]) => {
        if (events.has(ev)) {
          events.delete(ev);

          if (events.size === 0) {
            listenerEventsMap.delete(listener);
          }
        }
      });

      if (listenerEventsMap.size === 0) {
        this.contextListenerEventsMap.delete(context);
      }
    });

    return this;
  }

  removeAllListenerOccurences(listener) {
    Array.from(this.contextListenerEventsMap.entries()).forEach(([context, listenerEventsMap]) => {
      if (!(listenerEventsMap instanceof Map)) {
        return;
      }

      if (listenerEventsMap.has(listener)) {
        listenerEventsMap.delete(listener);

        if (listenerEventsMap.size === 0) {
          this.contextListenerEventsMap.delete(context);
        }
      }
    });

    return this;
  }

  removeAllContextOccurences(context) {
    if (this.contextListenerEventsMap.has(context)) {
      this.contextListenerEventsMap.delete(context);
    }

    return this;
  }

  removeEventForListener(ev, listener) {
    Array.from(this.contextListenerEventsMap.entries()).forEach(([context, listenerEventsMap]) => {
      if (!(listenerEventsMap instanceof Map)) {
        return;
      }

      if (listenerEventsMap.has(listener) && listenerEventsMap.get(listener).has(ev)) {
        listenerEventsMap.get(listener).delete(ev);

        if (listenerEventsMap.get(listener).size === 0) {
          listenerEventsMap.delete(listener);
        }

        if (listenerEventsMap.size === 0) {
          this.contextListenerEventsMap.delete(context);
        }
      }
    });

    return this;
  }

  removeEventForContext(ev, context) {
    if (!this.contextListenerEventsMap.has(context)) {
      return this;
    }

    Array.from(this.contextListenerEventsMap.get(context).entries()).forEach(([listener, events]) => {
      if (events.has(ev)) {
        events.delete(ev);

        if (events.size === 0) {
          this.contextListenerEventsMap.get(context).delete(listener);
        }
      }
    });

    if (this.contextListenerEventsMap.get(context).size === 0) {
      this.contextListenerEventsMap.delete(context);
    }

    return this;
  }

  removeEventForListenerAndContext(ev, listener, context) {
    if (
      this.contextListenerEventsMap.has(context) &&
      this.contextListenerEventsMap.get(context).has(listener) &&
      this.contextListenerEventsMap.get(context).get(listener).has(ev)
    ) {
      this.contextListenerEventsMap.get(context).get(listener).delete(ev);

      if (this.contextListenerEventsMap.get(context).get(listener).size === 0) {
        this.contextListenerEventsMap.get(context).delete(listener);

        if (this.contextListenerEventsMap.get(context).size === 0) {
          this.contextListenerEventsMap.delete(context);
        }
      }
    }

    return this;
  }
}
