function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var Queuery = /*#__PURE__*/function () {
  function Queuery(options) {
    _classCallCheck(this, Queuery);

    var _ref = options || {},
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 3 : _ref$limit,
        _ref$retries = _ref.retries,
        retries = _ref$retries === void 0 ? 3 : _ref$retries,
        verbose = _ref.verbose;

    this.queue = [];
    this.running = 0;
    this.limit = limit;
    this.retries = retries;
    this.results = [];
    this.verbose = verbose;
  }

  _createClass(Queuery, [{
    key: "task",
    value: function task(promiseWrapper) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this.taskWithName.apply(this, [args, promiseWrapper].concat(args));
    }
  }, {
    key: "taskWithName",
    value: function taskWithName(name, promiseWrapper) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      this.queue.push({
        name: name,
        promiseWrapper: promiseWrapper,
        args: args.length ? args : [],
        retries: 0
      });
    }
  }, {
    key: "remove",
    value: function remove(name) {
      var index = this.queue.findIndex(function (item) {
        return item.name === name;
      });

      if (index === -1) {
        return;
      }

      this.queue.splice(index, 1);
      this.verbose && console.log(name, 'removed');
    }
  }, {
    key: "__checkNext",
    value: function __checkNext(done) {
      var _this = this;

      if (!this.queue.length) {
        done();
        return;
      }

      var item = this.queue.shift();
      var name = item.name,
          promiseWrapper = item.promiseWrapper,
          args = item.args,
          retries = item.retries;

      if (!retries) {
        this.running++;
      }

      var promise = promiseWrapper.apply(void 0, _toConsumableArray(args));
      promise.then(function (data) {
        _this.running--;
        _this.verbose && console.log(name, 'finished');

        _this.results.push({
          name: name,
          payload: data
        });

        _this.__checkNext(done);

        return data;
      })["catch"](function (err) {
        if (retries < _this.retries) {
          _this.queue.push(_objectSpread2({}, item, {
            retries: retries + 1
          }));

          _this.verbose && console.log(name, 'is retrying: ', retries);

          _this.__checkNext(done);
        } else {
          _this.running--;
          _this.verbose && console.error(name, 'failed');

          _this.results.push({
            name: name,
            payload: err
          });

          _this.__checkNext(done);

          return err;
        }
      });
    }
  }, {
    key: "start",
    value: function start(onFinish) {
      var _this2 = this;

      var length = this.queue.length < this.limit ? this.queue.length : this.limit;

      if (!length) {
        onFinish(this.results);
        return;
      }

      var getDone = function getDone(resolve) {
        var count = 0;
        return function () {
          count++;

          if (count >= length) {
            resolve();
          }
        };
      };

      new Promise(function (resolve) {
        var done = getDone(resolve);

        for (var i = 0; i < length; i++) {
          _this2.__checkNext(done);
        }
      }).then(function () {
        onFinish(_this2.results);
      });
    }
  }]);

  return Queuery;
}();

export default Queuery;
