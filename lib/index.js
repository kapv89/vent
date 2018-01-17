'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vent = function () {
  function Vent() {
    _classCallCheck(this, Vent);

    this.contextListenerEventsMap = new Map();
    this.defaultContext = {};
  }
  // a nested map to track things from context to listener


  // a default context when no context is provided


  _createClass(Vent, [{
    key: 'on',
    value: function on() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      switch (args.length) {
        case 0:
        case 1:
          throw new Error('invalid args');
        case 2:
          return this.on.apply(this, args.concat([this.defaultContext]));
        default:
          var ev = args[0],
              listener = args[1],
              context = args[2];


          if ((0, _lodash.isArray)(ev)) {
            ev.forEach(function (event) {
              return _this.on(event, listener, context);
            });
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
  }, {
    key: 'once',
    value: function once() {
      var _this2 = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _ref = args.length === 2 ? [].concat(args, [this.defaultContext]) : args,
          _ref2 = _slicedToArray(_ref, 3),
          ev = _ref2[0],
          listener = _ref2[1],
          context = _ref2[2];

      if ((0, _lodash.isArray)(ev)) {
        ev.forEach(function (event) {
          return _this2.once(event, listener, context);
        });
        return this;
      } else {
        var onceListener = function onceListener() {
          listener.bind(context).apply(undefined, args);
          _this2.off(ev, onceListener, context);
        };

        return this.on(ev, onceListener, context);
      }
    }
  }, {
    key: 'off',
    value: function off() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      switch (args.length) {
        case 0:
          throw new Error('invalid args');
        case 1:
          if ((0, _lodash.isString)(args[0])) {
            // all listeners being removed for an event
            var _ev = args[0];

            this.removeAllEventOccurences(_ev);
          } else if ((0, _lodash.isFunction)(args[0])) {
            // a listener being removed from all relevant events
            var _listener = args[0];

            this.removeAllListenerOccurences(_listener);
          } else {
            // all listener for a context being removed
            var _context = args[0];

            this.removeAllContextOccurences(_context);
          }

          return this;

        case 2:
          // only 2 variations expected, [ev, listener] and [ev, context]
          if ((0, _lodash.isFunction)(args[1])) {
            // [ev, listener]
            var _ev2 = args[0],
                _listener2 = args[1];

            this.removeEventForListener(_ev2, _listener2);
          } else {
            // [ev, context]
            var _ev3 = args[0],
                _context2 = args[1];

            this.removeEventForContext(_ev3, _context2);
          }

          return this;

        default:
          // [ev, listener, context]
          var ev = args[0],
              listener = args[1],
              context = args[2];

          this.removeEventForListenerAndContext(ev, listener, context);
          return this;
      }
    }
  }, {
    key: 'emit',
    value: function emit(ctx, ev) {
      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      if ((0, _lodash.isString)(ctx)) {
        var _ref3 = [this.defaultContext, ctx, (0, _lodash.isUndefined)(ev) ? [] : [ev].concat(_toConsumableArray(args))];
        ctx = _ref3[0];
        ev = _ref3[1];
        args = _ref3[2];
      }

      this.getListenerContextTuplesForEvent(ev).forEach(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            listener = _ref5[0],
            context = _ref5[1];

        if (context === ctx) {
          listener.bind(context).apply(undefined, _toConsumableArray(args));
        }
      });
      return this;
    }
  }, {
    key: 'getEventsForListener',
    value: function getEventsForListener(listener) {
      return Array.from(this.contextListenerEventsMap.entries()).filter(function (listenerEventsMap) {
        return listenerEventsMap instanceof Map && listenerEventsMap.has(listener);
      }).map(function (listenerEventsMap) {
        return Array.from(listenerEventsMap.get(listener).values());
      }).reduce(function (allEvents, listenerEvents) {
        return allEvents.concat(listenerEvents);
      }, []).reduce(function (events, ev) {
        return events.concat([ev]);
      }, []);
    }
  }, {
    key: 'getListenerEventTuplesForContext',
    value: function getListenerEventTuplesForContext(context) {
      if (!this.contextListenerEventsMap.has(context)) {
        return [];
      } else {
        return Array.from(this.contextListenerEventsMap.get(context).entries()).map(function (_ref6) {
          var _ref7 = _slicedToArray(_ref6, 2),
              listener = _ref7[0],
              listenerEventsMap = _ref7[1];

          if (!(listenerEventsMap instanceof Map)) {
            return [];
          }

          return Array.from(listenerEventsMap.get(listener).values()).map(function (ev) {
            return [listener, ev];
          });
        }).reduce(function (allTuples, listenerTuples) {
          return allTuples.concat(listenerTuples);
        }, []);
      }
    }
  }, {
    key: 'getListenerContextTuplesForEvent',
    value: function getListenerContextTuplesForEvent(ev) {
      return Array.from(this.contextListenerEventsMap.entries()).map(function (_ref8) {
        var _ref9 = _slicedToArray(_ref8, 2),
            context = _ref9[0],
            listenerEventsMap = _ref9[1];

        if (!(listenerEventsMap instanceof Map)) {
          return [];
        }

        return Array.from(listenerEventsMap.entries()).filter(function (_ref10) {
          var _ref11 = _slicedToArray(_ref10, 2),
              events = _ref11[1];

          return events.has(ev);
        }).map(function (_ref12) {
          var _ref13 = _slicedToArray(_ref12, 1),
              listener = _ref13[0];

          return [listener, context];
        });
      }).reduce(function (all, listenerContextTuples) {
        return all.concat(listenerContextTuples);
      }, []);
    }
  }, {
    key: 'removeAllEventOccurences',
    value: function removeAllEventOccurences(ev) {
      var _this3 = this;

      Array.from(this.contextListenerEventsMap.entries()).forEach(function (_ref14) {
        var _ref15 = _slicedToArray(_ref14, 2),
            context = _ref15[0],
            listenerEventsMap = _ref15[1];

        if (!(listenerEventsMap instanceof Map)) {
          return;
        }

        Array.from(listenerEventsMap.entries()).forEach(function (_ref16) {
          var _ref17 = _slicedToArray(_ref16, 2),
              listener = _ref17[0],
              events = _ref17[1];

          if (events.has(ev)) {
            events.delete(ev);

            if (events.size === 0) {
              listenerEventsMap.delete(listener);
            }
          }
        });

        if (listenerEventsMap.size === 0) {
          _this3.contextListenerEventsMap.delete(context);
        }
      });

      return this;
    }
  }, {
    key: 'removeAllListenerOccurences',
    value: function removeAllListenerOccurences(listener) {
      var _this4 = this;

      Array.from(this.contextListenerEventsMap.entries()).forEach(function (_ref18) {
        var _ref19 = _slicedToArray(_ref18, 2),
            context = _ref19[0],
            listenerEventsMap = _ref19[1];

        if (!(listenerEventsMap instanceof Map)) {
          return;
        }

        if (listenerEventsMap.has(listener)) {
          listenerEventsMap.delete(listener);

          if (listenerEventsMap.size === 0) {
            _this4.contextListenerEventsMap.delete(context);
          }
        }
      });

      return this;
    }
  }, {
    key: 'removeAllContextOccurences',
    value: function removeAllContextOccurences(context) {
      if (this.contextListenerEventsMap.has(context)) {
        this.contextListenerEventsMap.delete(context);
      }

      return this;
    }
  }, {
    key: 'removeEventForListener',
    value: function removeEventForListener(ev, listener) {
      var _this5 = this;

      Array.from(this.contextListenerEventsMap.entries()).forEach(function (_ref20) {
        var _ref21 = _slicedToArray(_ref20, 2),
            context = _ref21[0],
            listenerEventsMap = _ref21[1];

        if (!(listenerEventsMap instanceof Map)) {
          return;
        }

        if (listenerEventsMap.has(listener) && listenerEventsMap.get(listener).has(ev)) {
          listenerEventsMap.get(listener).delete(ev);

          if (listenerEventsMap.get(listener).size === 0) {
            listenerEventsMap.delete(listener);
          }

          if (listenerEventsMap.size === 0) {
            _this5.contextListenerEventsMap.delete(context);
          }
        }
      });

      return this;
    }
  }, {
    key: 'removeEventForContext',
    value: function removeEventForContext(ev, context) {
      var _this6 = this;

      if (!this.contextListenerEventsMap.has(context)) {
        return this;
      }

      Array.from(this.contextListenerEventsMap.get(context).entries()).forEach(function (_ref22) {
        var _ref23 = _slicedToArray(_ref22, 2),
            listener = _ref23[0],
            events = _ref23[1];

        if (events.has(ev)) {
          events.delete(ev);

          if (events.size === 0) {
            _this6.contextListenerEventsMap.get(context).delete(listener);
          }
        }
      });

      if (this.contextListenerEventsMap.get(context).size === 0) {
        this.contextListenerEventsMap.delete(context);
      }

      return this;
    }
  }, {
    key: 'removeEventForListenerAndContext',
    value: function removeEventForListenerAndContext(ev, listener, context) {
      if (this.contextListenerEventsMap.has(context) && this.contextListenerEventsMap.get(context).has(listener) && this.contextListenerEventsMap.get(context).get(listener).has(ev)) {
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
  }]);

  return Vent;
}();

exports.default = Vent;