import Ae, { useState as J, useRef as De, useEffect as G, useCallback as fr, forwardRef as dr, useImperativeHandle as vr } from "react";
var ae = { exports: {} }, V = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Pe;
function pr() {
  if (Pe)
    return V;
  Pe = 1;
  var d = Ae, v = Symbol.for("react.element"), w = Symbol.for("react.fragment"), R = Object.prototype.hasOwnProperty, y = d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, E = { key: !0, ref: !0, __self: !0, __source: !0 };
  function b(u, c, m) {
    var a, i = {}, l = null, S = null;
    m !== void 0 && (l = "" + m), c.key !== void 0 && (l = "" + c.key), c.ref !== void 0 && (S = c.ref);
    for (a in c)
      R.call(c, a) && !E.hasOwnProperty(a) && (i[a] = c[a]);
    if (u && u.defaultProps)
      for (a in c = u.defaultProps, c)
        i[a] === void 0 && (i[a] = c[a]);
    return { $$typeof: v, type: u, key: l, ref: S, props: i, _owner: y.current };
  }
  return V.Fragment = w, V.jsx = b, V.jsxs = b, V;
}
var L = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var je;
function mr() {
  return je || (je = 1, process.env.NODE_ENV !== "production" && function() {
    var d = Ae, v = Symbol.for("react.element"), w = Symbol.for("react.portal"), R = Symbol.for("react.fragment"), y = Symbol.for("react.strict_mode"), E = Symbol.for("react.profiler"), b = Symbol.for("react.provider"), u = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), a = Symbol.for("react.suspense_list"), i = Symbol.for("react.memo"), l = Symbol.for("react.lazy"), S = Symbol.for("react.offscreen"), C = Symbol.iterator, A = "@@iterator";
    function D(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = C && e[C] || e[A];
      return typeof r == "function" ? r : null;
    }
    var g = d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function p(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        T("error", e, t);
      }
    }
    function T(e, r, t) {
      {
        var n = g.ReactDebugCurrentFrame, f = n.getStackAddendum();
        f !== "" && (r += "%s", t = t.concat([f]));
        var h = t.map(function(s) {
          return String(s);
        });
        h.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, h);
      }
    }
    var P = !1, Fe = !1, Ie = !1, $e = !1, Ye = !1, ie;
    ie = Symbol.for("react.module.reference");
    function Me(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === R || e === E || Ye || e === y || e === m || e === a || $e || e === S || P || Fe || Ie || typeof e == "object" && e !== null && (e.$$typeof === l || e.$$typeof === i || e.$$typeof === b || e.$$typeof === u || e.$$typeof === c || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ie || e.getModuleId !== void 0));
    }
    function Ne(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var f = r.displayName || r.name || "";
      return f !== "" ? t + "(" + f + ")" : t;
    }
    function oe(e) {
      return e.displayName || "Context";
    }
    function k(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && p("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case R:
          return "Fragment";
        case w:
          return "Portal";
        case E:
          return "Profiler";
        case y:
          return "StrictMode";
        case m:
          return "Suspense";
        case a:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case u:
            var r = e;
            return oe(r) + ".Consumer";
          case b:
            var t = e;
            return oe(t._context) + ".Provider";
          case c:
            return Ne(e, e.render, "ForwardRef");
          case i:
            var n = e.displayName || null;
            return n !== null ? n : k(e.type) || "Memo";
          case l: {
            var f = e, h = f._payload, s = f._init;
            try {
              return k(s(h));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var I = Object.assign, M = 0, ue, se, ce, le, fe, de, ve;
    function pe() {
    }
    pe.__reactDisabledLog = !0;
    function Ve() {
      {
        if (M === 0) {
          ue = console.log, se = console.info, ce = console.warn, le = console.error, fe = console.group, de = console.groupCollapsed, ve = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: pe,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        M++;
      }
    }
    function Le() {
      {
        if (M--, M === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: I({}, e, {
              value: ue
            }),
            info: I({}, e, {
              value: se
            }),
            warn: I({}, e, {
              value: ce
            }),
            error: I({}, e, {
              value: le
            }),
            group: I({}, e, {
              value: fe
            }),
            groupCollapsed: I({}, e, {
              value: de
            }),
            groupEnd: I({}, e, {
              value: ve
            })
          });
        }
        M < 0 && p("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var H = g.ReactCurrentDispatcher, K;
    function W(e, r, t) {
      {
        if (K === void 0)
          try {
            throw Error();
          } catch (f) {
            var n = f.stack.trim().match(/\n( *(at )?)/);
            K = n && n[1] || "";
          }
        return `
` + K + e;
      }
    }
    var X = !1, B;
    {
      var We = typeof WeakMap == "function" ? WeakMap : Map;
      B = new We();
    }
    function me(e, r) {
      if (!e || X)
        return "";
      {
        var t = B.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      X = !0;
      var f = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var h;
      h = H.current, H.current = null, Ve();
      try {
        if (r) {
          var s = function() {
            throw Error();
          };
          if (Object.defineProperty(s.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(s, []);
            } catch (F) {
              n = F;
            }
            Reflect.construct(e, [], s);
          } else {
            try {
              s.call();
            } catch (F) {
              n = F;
            }
            e.call(s.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (F) {
            n = F;
          }
          e();
        }
      } catch (F) {
        if (F && n && typeof F.stack == "string") {
          for (var o = F.stack.split(`
`), O = n.stack.split(`
`), _ = o.length - 1, x = O.length - 1; _ >= 1 && x >= 0 && o[_] !== O[x]; )
            x--;
          for (; _ >= 1 && x >= 0; _--, x--)
            if (o[_] !== O[x]) {
              if (_ !== 1 || x !== 1)
                do
                  if (_--, x--, x < 0 || o[_] !== O[x]) {
                    var j = `
` + o[_].replace(" at new ", " at ");
                    return e.displayName && j.includes("<anonymous>") && (j = j.replace("<anonymous>", e.displayName)), typeof e == "function" && B.set(e, j), j;
                  }
                while (_ >= 1 && x >= 0);
              break;
            }
        }
      } finally {
        X = !1, H.current = h, Le(), Error.prepareStackTrace = f;
      }
      var Y = e ? e.displayName || e.name : "", Oe = Y ? W(Y) : "";
      return typeof e == "function" && B.set(e, Oe), Oe;
    }
    function Be(e, r, t) {
      return me(e, !1);
    }
    function Ue(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function U(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return me(e, Ue(e));
      if (typeof e == "string")
        return W(e);
      switch (e) {
        case m:
          return W("Suspense");
        case a:
          return W("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case c:
            return Be(e.render);
          case i:
            return U(e.type, r, t);
          case l: {
            var n = e, f = n._payload, h = n._init;
            try {
              return U(h(f), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var z = Object.prototype.hasOwnProperty, he = {}, ge = g.ReactDebugCurrentFrame;
    function q(e) {
      if (e) {
        var r = e._owner, t = U(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(t);
      } else
        ge.setExtraStackFrame(null);
    }
    function ze(e, r, t, n, f) {
      {
        var h = Function.call.bind(z);
        for (var s in e)
          if (h(e, s)) {
            var o = void 0;
            try {
              if (typeof e[s] != "function") {
                var O = Error((n || "React class") + ": " + t + " type `" + s + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[s] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw O.name = "Invariant Violation", O;
              }
              o = e[s](r, s, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (_) {
              o = _;
            }
            o && !(o instanceof Error) && (q(f), p("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, s, typeof o), q(null)), o instanceof Error && !(o.message in he) && (he[o.message] = !0, q(f), p("Failed %s type: %s", t, o.message), q(null));
          }
      }
    }
    var qe = Array.isArray;
    function Z(e) {
      return qe(e);
    }
    function Je(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function Ge(e) {
      try {
        return ye(e), !1;
      } catch {
        return !0;
      }
    }
    function ye(e) {
      return "" + e;
    }
    function Re(e) {
      if (Ge(e))
        return p("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Je(e)), ye(e);
    }
    var N = g.ReactCurrentOwner, He = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ee, _e, Q;
    Q = {};
    function Ke(e) {
      if (z.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Xe(e) {
      if (z.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Ze(e, r) {
      if (typeof e.ref == "string" && N.current && r && N.current.stateNode !== r) {
        var t = k(N.current.type);
        Q[t] || (p('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', k(N.current.type), e.ref), Q[t] = !0);
      }
    }
    function Qe(e, r) {
      {
        var t = function() {
          Ee || (Ee = !0, p("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function er(e, r) {
      {
        var t = function() {
          _e || (_e = !0, p("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var rr = function(e, r, t, n, f, h, s) {
      var o = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: v,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: s,
        // Record the component responsible for creating this element.
        _owner: h
      };
      return o._store = {}, Object.defineProperty(o._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(o, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: n
      }), Object.defineProperty(o, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: f
      }), Object.freeze && (Object.freeze(o.props), Object.freeze(o)), o;
    };
    function tr(e, r, t, n, f) {
      {
        var h, s = {}, o = null, O = null;
        t !== void 0 && (Re(t), o = "" + t), Xe(r) && (Re(r.key), o = "" + r.key), Ke(r) && (O = r.ref, Ze(r, f));
        for (h in r)
          z.call(r, h) && !He.hasOwnProperty(h) && (s[h] = r[h]);
        if (e && e.defaultProps) {
          var _ = e.defaultProps;
          for (h in _)
            s[h] === void 0 && (s[h] = _[h]);
        }
        if (o || O) {
          var x = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          o && Qe(s, x), O && er(s, x);
        }
        return rr(e, o, O, f, n, N.current, s);
      }
    }
    var ee = g.ReactCurrentOwner, be = g.ReactDebugCurrentFrame;
    function $(e) {
      if (e) {
        var r = e._owner, t = U(e.type, e._source, r ? r.type : null);
        be.setExtraStackFrame(t);
      } else
        be.setExtraStackFrame(null);
    }
    var re;
    re = !1;
    function te(e) {
      return typeof e == "object" && e !== null && e.$$typeof === v;
    }
    function xe() {
      {
        if (ee.current) {
          var e = k(ee.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function nr(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), t = e.lineNumber;
          return `

Check your code at ` + r + ":" + t + ".";
        }
        return "";
      }
    }
    var we = {};
    function ar(e) {
      {
        var r = xe();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function Te(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = ar(r);
        if (we[t])
          return;
        we[t] = !0;
        var n = "";
        e && e._owner && e._owner !== ee.current && (n = " It was passed a child from " + k(e._owner.type) + "."), $(e), p('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), $(null);
      }
    }
    function Se(e, r) {
      {
        if (typeof e != "object")
          return;
        if (Z(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            te(n) && Te(n, r);
          }
        else if (te(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var f = D(e);
          if (typeof f == "function" && f !== e.entries)
            for (var h = f.call(e), s; !(s = h.next()).done; )
              te(s.value) && Te(s.value, r);
        }
      }
    }
    function ir(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === c || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === i))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = k(r);
          ze(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !re) {
          re = !0;
          var f = k(r);
          p("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", f || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && p("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function or(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            $(e), p("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), $(null);
            break;
          }
        }
        e.ref !== null && ($(e), p("Invalid attribute `ref` supplied to `React.Fragment`."), $(null));
      }
    }
    function Ce(e, r, t, n, f, h) {
      {
        var s = Me(e);
        if (!s) {
          var o = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (o += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var O = nr(f);
          O ? o += O : o += xe();
          var _;
          e === null ? _ = "null" : Z(e) ? _ = "array" : e !== void 0 && e.$$typeof === v ? (_ = "<" + (k(e.type) || "Unknown") + " />", o = " Did you accidentally export a JSX literal instead of a component?") : _ = typeof e, p("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", _, o);
        }
        var x = tr(e, r, t, f, h);
        if (x == null)
          return x;
        if (s) {
          var j = r.children;
          if (j !== void 0)
            if (n)
              if (Z(j)) {
                for (var Y = 0; Y < j.length; Y++)
                  Se(j[Y], e);
                Object.freeze && Object.freeze(j);
              } else
                p("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Se(j, e);
        }
        return e === R ? or(x) : ir(x), x;
      }
    }
    function ur(e, r, t) {
      return Ce(e, r, t, !0);
    }
    function sr(e, r, t) {
      return Ce(e, r, t, !1);
    }
    var cr = sr, lr = ur;
    L.Fragment = R, L.jsx = cr, L.jsxs = lr;
  }()), L;
}
process.env.NODE_ENV === "production" ? ae.exports = pr() : ae.exports = mr();
var ke = ae.exports;
const hr = (d, v, w, R) => {
  let y = v / (w + R), E = Math.floor(d.length / y);
  y > d.length && (y = d.length, E = 1);
  const b = [];
  for (let u = 0; u < y; u++) {
    let c = 0;
    for (let m = 0; m < E && u * E + m < d.length; m++)
      c += d[u * E + m];
    b.push(c / E);
  }
  return b;
}, gr = (d, v, w, R, y, E) => {
  const b = v.height / 2, u = v.getContext("2d");
  u && (u.clearRect(0, 0, v.width, v.height), y !== "transparent" && (u.fillStyle = y, u.fillRect(0, 0, v.width, v.height)), d.forEach((c, m) => {
    u.fillStyle = E;
    const a = m * (w + R), i = b - c / 2, l = w, S = c || 1;
    u.beginPath(), u.roundRect ? (u.roundRect(a, i, l, S, 50), u.fill()) : u.fillRect(a, i, l, S);
  }));
}, _r = ({
  mediaRecorder: d,
  width: v = "100%",
  height: w = "100%",
  barWidth: R = 2,
  gap: y = 1,
  backgroundColor: E = "transparent",
  barColor: b = "rgb(160, 198, 255)",
  fftSize: u = 1024,
  maxDecibels: c = -10,
  minDecibels: m = -90,
  smoothingTimeConstant: a = 0.4
}) => {
  const [i] = J(() => new AudioContext()), [l, S] = J(), C = De(null);
  G(() => {
    if (!d.stream)
      return;
    const g = i.createAnalyser();
    S(g), g.fftSize = u, g.minDecibels = m, g.maxDecibels = c, g.smoothingTimeConstant = a, i.createMediaStreamSource(d.stream).connect(g);
  }, [d.stream]), G(() => {
    l && d.state === "recording" && A();
  }, [l, d.state]);
  const A = fr(() => {
    if (!l)
      return;
    const g = new Uint8Array(l == null ? void 0 : l.frequencyBinCount);
    d.state === "recording" ? (l == null || l.getByteFrequencyData(g), D(g), requestAnimationFrame(A)) : d.state === "paused" ? D(g) : d.state === "inactive" && i.state !== "closed" && i.close();
  }, [l, i.state]), D = (g) => {
    if (!C.current)
      return;
    const p = hr(
      g,
      C.current.width,
      R,
      y
    );
    gr(
      p,
      C.current,
      R,
      y,
      E,
      b
    );
  };
  return /* @__PURE__ */ ke.jsx(
    "canvas",
    {
      ref: C,
      width: v,
      height: w,
      style: {
        aspectRatio: "unset"
      }
    }
  );
}, yr = (d, v, w, R, y) => {
  const E = d.getChannelData(0), b = w / (R + y), u = Math.floor(E.length / b), c = v / 2;
  let m = [], a = 0;
  for (let i = 0; i < b; i++) {
    const l = [];
    let S = 0;
    const C = [];
    let A = 0;
    for (let T = 0; T < u && i * u + T < d.length; T++) {
      const P = E[i * u + T];
      P <= 0 && (l.push(P), S++), P > 0 && (C.push(P), A++);
    }
    const D = l.reduce((T, P) => T + P, 0) / S, p = { max: C.reduce((T, P) => T + P, 0) / A, min: D };
    p.max > a && (a = p.max), Math.abs(p.min) > a && (a = Math.abs(p.min)), m.push(p);
  }
  if (c * 0.8 > a * c) {
    const i = c * 0.8 / a;
    m = m.map((l) => ({
      max: l.max * i,
      min: l.min * i
    }));
  }
  return m;
}, ne = (d, v, w, R, y, E, b, u = 0, c = 1) => {
  const m = v.height / 2, a = v.getContext("2d");
  if (!a)
    return;
  a.clearRect(0, 0, v.width, v.height), y !== "transparent" && (a.fillStyle = y, a.fillRect(0, 0, v.width, v.height));
  const i = (u || 0) / c;
  d.forEach((l, S) => {
    const C = S / d.length, A = i > C;
    a.fillStyle = A && b ? b : E;
    const D = S * (w + R), g = m + l.min, p = w, T = m + l.max - g;
    a.beginPath(), a.roundRect ? (a.roundRect(D, g, p, T, 50), a.fill()) : a.fillRect(D, g, p, T);
  });
}, Rr = dr(
  ({
    blob: d,
    width: v,
    height: w,
    barWidth: R = 2,
    gap: y = 1,
    currentTime: E,
    style: b,
    backgroundColor: u = "transparent",
    barColor: c = "rgb(184, 184, 184)",
    barPlayedColor: m = "rgb(160, 198, 255)"
  }, a) => {
    const i = De(null), [l, S] = J([]), [C, A] = J(0);
    return vr(
      a,
      () => i.current,
      []
    ), G(() => {
      (async () => {
        if (!i.current)
          return;
        if (!d) {
          const T = Array.from({ length: 100 }, () => ({
            max: 0,
            min: 0
          }));
          ne(
            T,
            i.current,
            R,
            y,
            u,
            c,
            m
          );
          return;
        }
        const g = await d.arrayBuffer();
        await new AudioContext().decodeAudioData(g, (T) => {
          if (!i.current)
            return;
          A(T.duration);
          const P = yr(
            T,
            w,
            v,
            R,
            y
          );
          S(P), ne(
            P,
            i.current,
            R,
            y,
            u,
            c,
            m
          );
        });
      })();
    }, [d, i.current]), G(() => {
      i.current && ne(
        l,
        i.current,
        R,
        y,
        u,
        c,
        m,
        E,
        C
      );
    }, [E, C]), /* @__PURE__ */ ke.jsx(
      "canvas",
      {
        ref: i,
        width: v,
        height: w,
        style: {
          ...b
        }
      }
    );
  }
);
Rr.displayName = "AudioVisualizer";
export {
  Rr as AudioVisualizer,
  _r as LiveAudioVisualizer
};
