function re(o, f) {
  for (var s = 0; s < f.length; s++) {
    const p = f[s];
    if (typeof p != "string" && !Array.isArray(p)) {
      for (const c in p)
        if (c !== "default" && !(c in o)) {
          const l = Object.getOwnPropertyDescriptor(p, c);
          l && Object.defineProperty(o, c, l.get ? l : {
            enumerable: !0,
            get: () => p[c]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(o, Symbol.toStringTag, { value: "Module" }));
}
function oe(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
function ne(o) {
  if (o.__esModule)
    return o;
  var f = o.default;
  if (typeof f == "function") {
    var s = function p() {
      if (this instanceof p) {
        var c = [null];
        c.push.apply(c, arguments);
        var l = Function.bind.apply(f, c);
        return new l();
      }
      return f.apply(this, arguments);
    };
    s.prototype = f.prototype;
  } else
    s = {};
  return Object.defineProperty(s, "__esModule", { value: !0 }), Object.keys(o).forEach(function(p) {
    var c = Object.getOwnPropertyDescriptor(o, p);
    Object.defineProperty(s, p, c.get ? c : {
      enumerable: !0,
      get: function() {
        return o[p];
      }
    });
  }), s;
}
var ie = { exports: {} };
(function(o) {
  var f = function(s) {
    var p = Object.prototype, c = p.hasOwnProperty, l, j = typeof Symbol == "function" ? Symbol : {}, y = j.iterator || "@@iterator", m = j.asyncIterator || "@@asyncIterator", v = j.toStringTag || "@@toStringTag";
    function w(t, e, r) {
      return Object.defineProperty(t, e, {
        value: r,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), t[e];
    }
    try {
      w({}, "");
    } catch {
      w = function(e, r, i) {
        return e[r] = i;
      };
    }
    function C(t, e, r, i) {
      var n = e && e.prototype instanceof O ? e : O, d = Object.create(n.prototype), b = new u(i || []);
      return d._invoke = V(t, r, b), d;
    }
    s.wrap = C;
    function N(t, e, r) {
      try {
        return { type: "normal", arg: t.call(e, r) };
      } catch (i) {
        return { type: "throw", arg: i };
      }
    }
    var _ = "suspendedStart", G = "suspendedYield", U = "executing", P = "completed", L = {};
    function O() {
    }
    function T() {
    }
    function k() {
    }
    var D = {};
    w(D, y, function() {
      return this;
    });
    var B = Object.getPrototypeOf, M = B && B(B(h([])));
    M && M !== p && c.call(M, y) && (D = M);
    var $ = k.prototype = O.prototype = Object.create(D);
    T.prototype = k, w($, "constructor", k), w(k, "constructor", T), T.displayName = w(
      k,
      v,
      "GeneratorFunction"
    );
    function Y(t) {
      ["next", "throw", "return"].forEach(function(e) {
        w(t, e, function(r) {
          return this._invoke(e, r);
        });
      });
    }
    s.isGeneratorFunction = function(t) {
      var e = typeof t == "function" && t.constructor;
      return e ? e === T || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (e.displayName || e.name) === "GeneratorFunction" : !1;
    }, s.mark = function(t) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(t, k) : (t.__proto__ = k, w(t, v, "GeneratorFunction")), t.prototype = Object.create($), t;
    }, s.awrap = function(t) {
      return { __await: t };
    };
    function I(t, e) {
      function r(d, b, F, S) {
        var E = N(t[d], t, b);
        if (E.type === "throw")
          S(E.arg);
        else {
          var H = E.arg, z = H.value;
          return z && typeof z == "object" && c.call(z, "__await") ? e.resolve(z.__await).then(function(R) {
            r("next", R, F, S);
          }, function(R) {
            r("throw", R, F, S);
          }) : e.resolve(z).then(function(R) {
            H.value = R, F(H);
          }, function(R) {
            return r("throw", R, F, S);
          });
        }
      }
      var i;
      function n(d, b) {
        function F() {
          return new e(function(S, E) {
            r(d, b, S, E);
          });
        }
        return i = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        i ? i.then(
          F,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          F
        ) : F();
      }
      this._invoke = n;
    }
    Y(I.prototype), w(I.prototype, m, function() {
      return this;
    }), s.AsyncIterator = I, s.async = function(t, e, r, i, n) {
      n === void 0 && (n = Promise);
      var d = new I(
        C(t, e, r, i),
        n
      );
      return s.isGeneratorFunction(e) ? d : d.next().then(function(b) {
        return b.done ? b.value : d.next();
      });
    };
    function V(t, e, r) {
      var i = _;
      return function(d, b) {
        if (i === U)
          throw new Error("Generator is already running");
        if (i === P) {
          if (d === "throw")
            throw b;
          return g();
        }
        for (r.method = d, r.arg = b; ; ) {
          var F = r.delegate;
          if (F) {
            var S = q(F, r);
            if (S) {
              if (S === L)
                continue;
              return S;
            }
          }
          if (r.method === "next")
            r.sent = r._sent = r.arg;
          else if (r.method === "throw") {
            if (i === _)
              throw i = P, r.arg;
            r.dispatchException(r.arg);
          } else
            r.method === "return" && r.abrupt("return", r.arg);
          i = U;
          var E = N(t, e, r);
          if (E.type === "normal") {
            if (i = r.done ? P : G, E.arg === L)
              continue;
            return {
              value: E.arg,
              done: r.done
            };
          } else
            E.type === "throw" && (i = P, r.method = "throw", r.arg = E.arg);
        }
      };
    }
    function q(t, e) {
      var r = t.iterator[e.method];
      if (r === l) {
        if (e.delegate = null, e.method === "throw") {
          if (t.iterator.return && (e.method = "return", e.arg = l, q(t, e), e.method === "throw"))
            return L;
          e.method = "throw", e.arg = new TypeError(
            "The iterator does not provide a 'throw' method"
          );
        }
        return L;
      }
      var i = N(r, t.iterator, e.arg);
      if (i.type === "throw")
        return e.method = "throw", e.arg = i.arg, e.delegate = null, L;
      var n = i.arg;
      if (!n)
        return e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, L;
      if (n.done)
        e[t.resultName] = n.value, e.next = t.nextLoc, e.method !== "return" && (e.method = "next", e.arg = l);
      else
        return n;
      return e.delegate = null, L;
    }
    Y($), w($, v, "Generator"), w($, y, function() {
      return this;
    }), w($, "toString", function() {
      return "[object Generator]";
    });
    function x(t) {
      var e = { tryLoc: t[0] };
      1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
    }
    function a(t) {
      var e = t.completion || {};
      e.type = "normal", delete e.arg, t.completion = e;
    }
    function u(t) {
      this.tryEntries = [{ tryLoc: "root" }], t.forEach(x, this), this.reset(!0);
    }
    s.keys = function(t) {
      var e = [];
      for (var r in t)
        e.push(r);
      return e.reverse(), function i() {
        for (; e.length; ) {
          var n = e.pop();
          if (n in t)
            return i.value = n, i.done = !1, i;
        }
        return i.done = !0, i;
      };
    };
    function h(t) {
      if (t) {
        var e = t[y];
        if (e)
          return e.call(t);
        if (typeof t.next == "function")
          return t;
        if (!isNaN(t.length)) {
          var r = -1, i = function n() {
            for (; ++r < t.length; )
              if (c.call(t, r))
                return n.value = t[r], n.done = !1, n;
            return n.value = l, n.done = !0, n;
          };
          return i.next = i;
        }
      }
      return { next: g };
    }
    s.values = h;
    function g() {
      return { value: l, done: !0 };
    }
    return u.prototype = {
      constructor: u,
      reset: function(t) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = l, this.done = !1, this.delegate = null, this.method = "next", this.arg = l, this.tryEntries.forEach(a), !t)
          for (var e in this)
            e.charAt(0) === "t" && c.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = l);
      },
      stop: function() {
        this.done = !0;
        var t = this.tryEntries[0], e = t.completion;
        if (e.type === "throw")
          throw e.arg;
        return this.rval;
      },
      dispatchException: function(t) {
        if (this.done)
          throw t;
        var e = this;
        function r(S, E) {
          return d.type = "throw", d.arg = t, e.next = S, E && (e.method = "next", e.arg = l), !!E;
        }
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var n = this.tryEntries[i], d = n.completion;
          if (n.tryLoc === "root")
            return r("end");
          if (n.tryLoc <= this.prev) {
            var b = c.call(n, "catchLoc"), F = c.call(n, "finallyLoc");
            if (b && F) {
              if (this.prev < n.catchLoc)
                return r(n.catchLoc, !0);
              if (this.prev < n.finallyLoc)
                return r(n.finallyLoc);
            } else if (b) {
              if (this.prev < n.catchLoc)
                return r(n.catchLoc, !0);
            } else if (F) {
              if (this.prev < n.finallyLoc)
                return r(n.finallyLoc);
            } else
              throw new Error("try statement without catch or finally");
          }
        }
      },
      abrupt: function(t, e) {
        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
          var i = this.tryEntries[r];
          if (i.tryLoc <= this.prev && c.call(i, "finallyLoc") && this.prev < i.finallyLoc) {
            var n = i;
            break;
          }
        }
        n && (t === "break" || t === "continue") && n.tryLoc <= e && e <= n.finallyLoc && (n = null);
        var d = n ? n.completion : {};
        return d.type = t, d.arg = e, n ? (this.method = "next", this.next = n.finallyLoc, L) : this.complete(d);
      },
      complete: function(t, e) {
        if (t.type === "throw")
          throw t.arg;
        return t.type === "break" || t.type === "continue" ? this.next = t.arg : t.type === "return" ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : t.type === "normal" && e && (this.next = e), L;
      },
      finish: function(t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.finallyLoc === t)
            return this.complete(r.completion, r.afterLoc), a(r), L;
        }
      },
      catch: function(t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.tryLoc === t) {
            var i = r.completion;
            if (i.type === "throw") {
              var n = i.arg;
              a(r);
            }
            return n;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function(t, e, r) {
        return this.delegate = {
          iterator: h(t),
          resultName: e,
          nextLoc: r
        }, this.method === "next" && (this.arg = l), L;
      }
    }, s;
  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    o.exports
  );
  try {
    regeneratorRuntime = f;
  } catch {
    typeof globalThis == "object" ? globalThis.regeneratorRuntime = f : Function("r", "regeneratorRuntime = r")(f);
  }
})(ie);
var ae = {
  defaultArgs: [
    /* args[0] is always the binary path */
    "./ffmpeg",
    /* Disable interaction mode */
    "-nostdin",
    /* Force to override output file */
    "-y"
  ],
  baseOptions: {
    /* Flag to turn on/off log messages in console */
    log: !1,
    /*
     * Custom logger to get ffmpeg.wasm output messages.
     * a sample logger looks like this:
     *
     * ```
     * logger = ({ type, message }) => {
     *   console.log(type, message);
     * }
     * ```
     *
     * type can be one of following:
     *
     * info: internal workflow debug messages
     * fferr: ffmpeg native stderr output
     * ffout: ffmpeg native stdout output
     */
    logger: () => {
    },
    /*
     * Progress handler to get current progress of ffmpeg command.
     * a sample progress handler looks like this:
     *
     * ```
     * progress = ({ ratio }) => {
     *   console.log(ratio);
     * }
     * ```
     *
     * ratio is a float number between 0 to 1.
     */
    progress: () => {
    },
    /*
     * Path to find/download ffmpeg.wasm-core,
     * this value should be overwriten by `defaultOptions` in
     * each environment.
     */
    corePath: ""
  }
}, se = (o, f) => {
  const s = o._malloc(f.length * Uint32Array.BYTES_PER_ELEMENT);
  return f.forEach((p, c) => {
    const l = o.lengthBytesUTF8(p) + 1, j = o._malloc(l);
    o.stringToUTF8(p, j, l), o.setValue(s + Uint32Array.BYTES_PER_ELEMENT * c, j, "i32");
  }), [f.length, s];
};
const fe = "@ffmpeg/ffmpeg", ce = "0.11.6", le = "FFmpeg WebAssembly version", pe = "src/index.js", ue = "src/index.d.ts", he = {
  example: "examples"
}, de = {
  start: "node scripts/server.js",
  "start:worker": "node scripts/worker-server.js",
  build: "rimraf dist && webpack --config scripts/webpack.config.prod.js",
  "build:worker": "rimraf dist && webpack --config scripts/webpack.config.worker.prod.js",
  prepublishOnly: "npm run build",
  lint: "eslint src",
  wait: "rimraf dist && wait-on http://localhost:3000/dist/ffmpeg.dev.js",
  test: "npm-run-all -p -r start test:all",
  "test:all": "npm-run-all wait test:browser:ffmpeg test:node:all",
  "test:node": "node node_modules/mocha/bin/_mocha --exit --bail --require ./scripts/test-helper.js",
  "test:node:all": "npm run test:node -- ./tests/*.test.js",
  "test:browser": "mocha-headless-chrome -a allow-file-access-from-files -a incognito -a no-sandbox -a disable-setuid-sandbox -a disable-logging -t 300000",
  "test:browser:ffmpeg": "npm run test:browser -- -f ./tests/ffmpeg.test.html"
}, me = {
  "./src/node/index.js": "./src/browser/index.js"
}, ge = {
  type: "git",
  url: "git+https://github.com/ffmpegwasm/ffmpeg.wasm.git"
}, we = [
  "ffmpeg",
  "WebAssembly",
  "video"
], ye = "Jerome Wu <jeromewus@gmail.com>", ve = "MIT", be = {
  url: "https://github.com/ffmpegwasm/ffmpeg.wasm/issues"
}, Fe = {
  node: ">=12.16.1"
}, Ee = "https://github.com/ffmpegwasm/ffmpeg.wasm#readme", je = {
  "is-url": "^1.2.4",
  "node-fetch": "^2.6.1",
  "regenerator-runtime": "^0.13.7",
  "resolve-url": "^0.2.1"
}, Le = {
  "@babel/core": "^7.12.3",
  "@babel/preset-env": "^7.12.1",
  "@ffmpeg/core": "^0.11.0",
  "@types/emscripten": "^1.39.4",
  "babel-eslint": "^10.1.0",
  "babel-loader": "^8.1.0",
  chai: "^4.2.0",
  cors: "^2.8.5",
  eslint: "^7.12.1",
  "eslint-config-airbnb-base": "^14.1.0",
  "eslint-plugin-import": "^2.22.1",
  express: "^4.17.1",
  mocha: "^8.2.1",
  "mocha-headless-chrome": "^2.0.3",
  "npm-run-all": "^4.1.5",
  "wait-on": "^5.3.0",
  webpack: "^5.3.2",
  "webpack-cli": "^4.1.0",
  "webpack-dev-middleware": "^4.0.0"
}, Q = {
  name: fe,
  version: ce,
  description: le,
  main: pe,
  types: ue,
  directories: he,
  scripts: de,
  browser: me,
  repository: ge,
  keywords: we,
  author: ye,
  license: ve,
  bugs: be,
  engines: Fe,
  homepage: Ee,
  dependencies: je,
  devDependencies: Le
}, Oe = typeof process < "u" && process.env.NODE_ENV === "development" ? new URL("/node_modules/@ffmpeg/core/dist/ffmpeg-core.js", self.location).href : `https://unpkg.com/@ffmpeg/core@${Q.devDependencies["@ffmpeg/core"].substring(1)}/dist/ffmpeg-core.js`, Se = { corePath: Oe };
let Z = !1, X = () => {
};
const _e = (o) => {
  Z = o;
}, Pe = (o) => {
  X = o;
}, ke = (o, f) => {
  X({ type: o, message: f }), Z && console.log(`[${o}] ${f}`);
};
var A = {
  logging: Z,
  setLogging: _e,
  setCustomLogger: Pe,
  log: ke
};
const $e = (o) => `
createFFmpegCore is not defined. ffmpeg.wasm is unable to find createFFmpegCore after loading ffmpeg-core.js from ${o}. Use another URL when calling createFFmpeg():

const ffmpeg = createFFmpeg({
  corePath: 'http://localhost:3000/ffmpeg-core.js',
});
`;
var K = {
  CREATE_FFMPEG_CORE_IS_NOT_DEFINED: $e
};
const W = async (o, f) => {
  A.log("info", `fetch ${o}`);
  const s = await (await fetch(o)).arrayBuffer();
  A.log("info", `${o} file size = ${s.byteLength} bytes`);
  const p = new Blob([s], { type: f }), c = URL.createObjectURL(p);
  return A.log("info", `${o} blob URL = ${c}`), c;
}, Ce = async ({
  corePath: o,
  workerPath: f,
  wasmPath: s
}) => {
  if (typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope) {
    if (typeof o != "string")
      throw Error("corePath should be a string!");
    const y = new URL(o, import.meta.url).href, m = await W(
      y,
      "application/javascript"
    ), v = await W(
      s !== void 0 ? s : y.replace("ffmpeg-core.js", "ffmpeg-core.wasm"),
      "application/wasm"
    ), w = await W(
      f !== void 0 ? f : y.replace("ffmpeg-core.js", "ffmpeg-core.worker.js"),
      "application/javascript"
    );
    return typeof createFFmpegCore > "u" ? new Promise((C) => {
      if (globalThis.importScripts(m), typeof createFFmpegCore > "u")
        throw Error(K.CREATE_FFMPEG_CORE_IS_NOT_DEFINED(y));
      A.log("info", "ffmpeg-core.js script loaded"), C({
        createFFmpegCore,
        corePath: m,
        wasmPath: v,
        workerPath: w
      });
    }) : (A.log("info", "ffmpeg-core.js script is loaded already"), Promise.resolve({
      createFFmpegCore,
      corePath: m,
      wasmPath: v,
      workerPath: w
    }));
  }
  if (typeof o != "string")
    throw Error("corePath should be a string!");
  const p = new URL(o, import.meta.url).href, c = await W(
    p,
    "application/javascript"
  ), l = await W(
    s !== void 0 ? s : p.replace("ffmpeg-core.js", "ffmpeg-core.wasm"),
    "application/wasm"
  ), j = await W(
    f !== void 0 ? f : p.replace("ffmpeg-core.js", "ffmpeg-core.worker.js"),
    "application/javascript"
  );
  return typeof createFFmpegCore > "u" ? new Promise((y) => {
    const m = document.createElement("script"), v = () => {
      if (m.removeEventListener("load", v), typeof createFFmpegCore > "u")
        throw Error(K.CREATE_FFMPEG_CORE_IS_NOT_DEFINED(p));
      A.log("info", "ffmpeg-core.js script loaded"), y({
        createFFmpegCore,
        corePath: c,
        wasmPath: l,
        workerPath: j
      });
    };
    m.src = c, m.type = "text/javascript", m.addEventListener("load", v), document.getElementsByTagName("head")[0].appendChild(m);
  }) : (A.log("info", "ffmpeg-core.js script is loaded already"), Promise.resolve({
    createFFmpegCore,
    corePath: c,
    wasmPath: l,
    workerPath: j
  }));
}, Te = (o) => new Promise((f, s) => {
  const p = new FileReader();
  p.onload = () => {
    f(p.result);
  }, p.onerror = ({ target: { error: { code: c } } }) => {
    s(Error(`File could not be read! Code=${c}`));
  }, p.readAsArrayBuffer(o);
}), Re = async (o) => {
  let f = o;
  return typeof o > "u" ? new Uint8Array() : (typeof o == "string" ? /data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(o) ? f = atob(o.split(",")[1]).split("").map((s) => s.charCodeAt(0)) : f = await (await fetch(new URL(o, import.meta.url).href)).arrayBuffer() : (o instanceof File || o instanceof Blob) && (f = await Te(o)), new Uint8Array(f));
}, Ae = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  defaultOptions: Se,
  fetchFile: Re,
  getCreateFFmpegCore: Ce
}, Symbol.toStringTag, { value: "Module" })), ee = /* @__PURE__ */ ne(Ae), { defaultArgs: Ne, baseOptions: Ge } = ae, Ue = se, { defaultOptions: De, getCreateFFmpegCore: Me } = ee, { version: Ie } = Q, J = Error("ffmpeg.wasm is not ready, make sure you have completed load().");
var We = (o = {}) => {
  const {
    log: f,
    logger: s,
    progress: p,
    ...c
  } = {
    ...Ge,
    ...De,
    ...o
  };
  let l = null, j = null, y = null, m = null, v = !1, w = () => {
  }, C = f, N = p, _ = 0, G = 0, U = !1, P = 0;
  const L = (a) => {
    a === "FFMPEG_END" && y !== null && (y(), y = null, m = null, v = !1);
  }, O = (a, u) => {
    w({ type: a, message: u }), C && console.log(`[${a}] ${u}`);
  }, T = (a) => {
    const [u, h, g] = a.split(":");
    return parseFloat(u) * 60 * 60 + parseFloat(h) * 60 + parseFloat(g);
  }, k = (a, u) => {
    if (typeof a == "string")
      if (a.startsWith("  Duration")) {
        const h = a.split(", ")[0].split(": ")[1], g = T(h);
        u({ duration: g, ratio: P }), (_ === 0 || _ > g) && (_ = g, U = !0);
      } else if (U && a.startsWith("    Stream")) {
        const h = a.match(/([\d.]+) fps/);
        if (h) {
          const g = parseFloat(h[1]);
          G = _ * g;
        } else
          G = 0;
        U = !1;
      } else if (a.startsWith("frame") || a.startsWith("size")) {
        const h = a.split("time=")[1].split(" ")[0], g = T(h), t = a.match(/frame=\s*(\d+)/);
        if (G && t) {
          const e = parseFloat(t[1]);
          P = Math.min(e / G, 1);
        } else
          P = g / _;
        u({ ratio: P, time: g });
      } else
        a.startsWith("video:") && (u({ ratio: 1 }), _ = 0);
  }, D = ({ type: a, message: u }) => {
    O(a, u), k(u, N), L(u);
  }, B = async () => {
    if (O("info", "load ffmpeg-core"), l === null) {
      O("info", "loading ffmpeg-core");
      const {
        createFFmpegCore: a,
        corePath: u,
        workerPath: h,
        wasmPath: g
      } = await Me(c);
      l = await a({
        /*
         * Assign mainScriptUrlOrBlob fixes chrome extension web worker issue
         * as there is no document.currentScript in the context of content_scripts
         */
        mainScriptUrlOrBlob: u,
        printErr: (t) => D({ type: "fferr", message: t }),
        print: (t) => D({ type: "ffout", message: t }),
        /*
         * locateFile overrides paths of files that is loaded by main script (ffmpeg-core.js).
         * It is critical for browser environment and we override both wasm and worker paths
         * as we are using blob URL instead of original URL to avoid cross origin issues.
         */
        locateFile: (t, e) => {
          if (typeof window < "u" || typeof WorkerGlobalScope < "u") {
            if (typeof g < "u" && t.endsWith("ffmpeg-core.wasm"))
              return g;
            if (typeof h < "u" && t.endsWith("ffmpeg-core.worker.js"))
              return h;
          }
          return e + t;
        }
      }), j = l.cwrap(c.mainName || "proxy_main", "number", ["number", "number"]), O("info", "ffmpeg-core loaded");
    } else
      throw Error("ffmpeg.wasm was loaded, you should not load it again, use ffmpeg.isLoaded() to check next time.");
  }, M = () => l !== null, $ = (...a) => {
    if (O("info", `run ffmpeg command: ${a.join(" ")}`), l === null)
      throw J;
    if (v)
      throw Error("ffmpeg.wasm can only run one command at a time");
    return v = !0, new Promise((u, h) => {
      const g = [...Ne, ...a].filter((t) => t.length !== 0);
      y = u, m = h, j(...Ue(l, g));
    });
  }, Y = (a, ...u) => {
    if (O("info", `run FS.${a} ${u.map((h) => typeof h == "string" ? h : `<${h.length} bytes binary file>`).join(" ")}`), l === null)
      throw J;
    {
      let h = null;
      try {
        h = l.FS[a](...u);
      } catch {
        throw Error(a === "readdir" ? `ffmpeg.FS('readdir', '${u[0]}') error. Check if the path exists, ex: ffmpeg.FS('readdir', '/')` : a === "readFile" ? `ffmpeg.FS('readFile', '${u[0]}') error. Check if the path exists` : "Oops, something went wrong in FS operation.");
      }
      return h;
    }
  }, I = () => {
    if (l === null)
      throw J;
    m && m("ffmpeg has exited"), v = !1;
    try {
      l.exit(1);
    } catch (a) {
      O(a.message), m && m(a);
    } finally {
      l = null, j = null, y = null, m = null;
    }
  }, V = (a) => {
    N = a;
  }, q = (a) => {
    w = a;
  }, x = (a) => {
    C = a;
  };
  return O("info", `use ffmpeg.wasm v${Ie}`), {
    setProgress: V,
    setLogger: q,
    setLogging: x,
    load: B,
    isLoaded: M,
    run: $,
    exit: I,
    FS: Y
  };
};
const Be = We, { fetchFile: ze } = ee;
var te = {
  /*
   * Create ffmpeg instance.
   * Each ffmpeg instance owns an isolated MEMFS and works
   * independently.
   *
   * For example:
   *
   * ```
   * const ffmpeg = createFFmpeg({
   *  log: true,
   *  logger: () => {},
   *  progress: () => {},
   *  corePath: '',
   * })
   * ```
   *
   * For the usage of these four arguments, check config.js
   *
   */
  createFFmpeg: Be,
  /*
   * Helper function for fetching files from various resource.
   * Sometimes the video/audio file you want to process may located
   * in a remote URL and somewhere in your local file system.
   *
   * This helper function helps you to fetch to file and return an
   * Uint8Array variable for ffmpeg.wasm to consume.
   *
   */
  fetchFile: ze
};
const Ye = /* @__PURE__ */ oe(te), qe = /* @__PURE__ */ re({
  __proto__: null,
  default: Ye
}, [te]);
export {
  qe as i
};
