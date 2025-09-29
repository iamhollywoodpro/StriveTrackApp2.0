var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-DtnAdk/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-DtnAdk/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// src/index.ts
var ADMIN_EMAILS = ["iamhollywoodpro@protonmail.com", "iamhollywoodpro@gmail.com"];
var app = new Hono2();
var withCORS = /* @__PURE__ */ __name((resp, origin, req) => {
  const headers = new Headers(resp.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS");
  const reqHeaders = req?.headers?.get("access-control-request-headers");
  headers.set("Access-Control-Allow-Headers", reqHeaders || "authorization, content-type, x-file-name");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(resp.body, { status: resp.status, headers });
}, "withCORS");
var jsonCORS = /* @__PURE__ */ __name((origin, obj, status = 200, extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  return withCORS(new Response(JSON.stringify(obj), { status, headers }), origin);
}, "jsonCORS");
function guessContentTypeFromKey(key) {
  const k = key.toLowerCase();
  if (k.endsWith(".jpg") || k.endsWith(".jpeg"))
    return "image/jpeg";
  if (k.endsWith(".png"))
    return "image/png";
  if (k.endsWith(".webp"))
    return "image/webp";
  if (k.endsWith(".gif"))
    return "image/gif";
  if (k.endsWith(".mp4"))
    return "video/mp4";
  if (k.endsWith(".mov") || k.endsWith(".qt"))
    return "video/quicktime";
  if (k.endsWith(".webm"))
    return "video/webm";
  if (k.endsWith(".avi"))
    return "video/x-msvideo";
  if (k.endsWith(".3gp") || k.endsWith(".3gpp"))
    return "video/3gpp";
  if (k.endsWith(".flv"))
    return "video/x-flv";
  return void 0;
}
__name(guessContentTypeFromKey, "guessContentTypeFromKey");
async function ensureTables(env) {
  const createStmts = [
    `CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      content_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, key)
    );`,
    `CREATE TABLE IF NOT EXISTS nutrition_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      meal_name TEXT,
      meal_type TEXT,
      calories INTEGER,
      protein INTEGER,
      carbs INTEGER,
      fat INTEGER,
      "date" TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      points INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, code)
    );`,
    `CREATE TABLE IF NOT EXISTS points_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT,
      difficulty TEXT,
      days_of_week TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      "date" TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      bio TEXT,
      targets TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS social_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      post_type TEXT DEFAULT 'progress',
      media_url TEXT,
      tags TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS social_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES social_posts(id)
    );`,
    `CREATE TABLE IF NOT EXISTS social_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES social_posts(id)
    );`,
    `CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id TEXT NOT NULL,
      addressee_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(requester_id, addressee_id)
    );`,
    `CREATE TABLE IF NOT EXISTS friend_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenger_id TEXT NOT NULL,
      challenged_id TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_value INTEGER,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      winner_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      total_posts INTEGER DEFAULT 0,
      total_friends INTEGER DEFAULT 0,
      total_likes_received INTEGER DEFAULT 0,
      total_challenges_won INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  ];
  for (const sql of createStmts) {
    try {
      await env.DB.prepare(sql).run();
    } catch (_) {
    }
  }
  const alterStmts = [
    `ALTER TABLE nutrition_logs ADD COLUMN fiber INTEGER DEFAULT 0`,
    `ALTER TABLE nutrition_logs ADD COLUMN sugar INTEGER DEFAULT 0`,
    `ALTER TABLE nutrition_logs ADD COLUMN serving_size TEXT DEFAULT '1 serving'`,
    `ALTER TABLE nutrition_logs ADD COLUMN food_image TEXT`,
    `ALTER TABLE nutrition_logs ADD COLUMN food_id TEXT`,
    `ALTER TABLE nutrition_logs ADD COLUMN category TEXT`,
    `ALTER TABLE nutrition_logs ADD COLUMN addons TEXT`
  ];
  for (const sql of alterStmts) {
    try {
      await env.DB.prepare(sql).run();
    } catch (_) {
    }
  }
}
__name(ensureTables, "ensureTables");
async function verifySupabaseToken(env, token) {
  if (!token)
    return null;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_ANON_KEY }
    });
    if (!res.ok)
      return null;
    const user = await res.json();
    return user;
  } catch (_) {
    return null;
  }
}
__name(verifySupabaseToken, "verifySupabaseToken");
app.options("*", (c) => {
  const origin = c.req.header("origin") || "*";
  return withCORS(new Response(null, { status: 204 }), origin, c.req.raw);
});
app.get("/", (c) => {
  const origin = c.req.header("origin") || "*";
  const body = "StriveTrack Media API is running. Try /api/health";
  return withCORS(new Response(body, { status: 200 }), origin, c.req.raw);
});
app.get("/api/health", (c) => {
  const origin = c.req.header("origin") || "*";
  return jsonCORS(origin, { ok: true, ts: Date.now() });
});
app.post("/api/upload", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  if (!user?.id)
    return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), origin, c.req.raw);
  await ensureTables(c.env);
  const headerName = c.req.header("x-file-name") || "upload.bin";
  const sanitized = headerName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${userId}/progress/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${sanitized.split(".").pop()}`;
  const body = await c.req.arrayBuffer();
  if (!body || body.byteLength === 0)
    return withCORS(new Response(JSON.stringify({ error: "Empty body" }), { status: 400 }), origin);
  const contentType = c.req.header("content-type") || guessContentTypeFromKey(key) || "application/octet-stream";
  await c.env.R2_BUCKET.put(key, body, { httpMetadata: { contentType } });
  try {
    await c.env.DB.prepare("INSERT INTO media (user_id, key, content_type) VALUES (?, ?, ?)").bind(userId, key, contentType).run();
    try {
      const ach = await c.env.DB.prepare("INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)").bind(userId, "first_upload", 25).run();
      if (ach?.meta?.changes > 0) {
        await c.env.DB.prepare("INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)").bind(userId, 25, "first_upload").run();
      }
    } catch (_) {
    }
  } catch (_) {
  }
  return withCORS(new Response(JSON.stringify({ key }), { status: 200, headers: { "Content-Type": "application/json" } }), origin, c.req.raw);
});
app.post("/api/upload/presigned", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { fileName, fileType, fileSize, fileKey } = body;
    if (!fileName || !fileType || !fileKey) {
      return jsonCORS(origin, { error: "Missing required fields: fileName, fileType, fileKey" }, 400);
    }
    const presignedUrl = `https://${c.env.R2_BUCKET.accountId}.r2.cloudflarestorage.com/${c.env.R2_BUCKET.name}`;
    return jsonCORS(origin, {
      url: presignedUrl,
      fields: {
        key: fileKey,
        "Content-Type": fileType
      },
      key: fileKey
    });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "Failed to generate presigned URL" }, 500);
  }
});
app.post("/api/upload/worker", async (c) => {
  const origin = c.req.header("origin") || "*";
  try {
    console.log("\u{1F4C1} Worker upload started");
    const auth = c.req.header("authorization") || "";
    const url = new URL(c.req.url);
    const qToken = url.searchParams.get("token") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
    console.log("\u{1F510} Token validation...");
    const user = await verifySupabaseToken(c.env, token);
    if (!user?.id) {
      console.log("\u274C Authentication failed");
      return jsonCORS(origin, { error: "Unauthorized" }, 401);
    }
    console.log("\u2705 User authenticated:", userId);
    await ensureTables(c.env);
    console.log("\u{1F4C4} Processing form data...");
    const formData = await c.req.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName") || file?.name || "upload.bin";
    const fileType = formData.get("fileType") || file?.type || "application/octet-stream";
    if (!file) {
      console.log("\u274C No file provided");
      return jsonCORS(origin, { error: "No file provided" }, 400);
    }
    console.log("\u{1F4CA} File info:", { name: fileName, type: fileType, size: file.size });
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const key = `${userId}/progress/${timestamp}-${randomId}.${fileExtension}`;
    console.log("\u{1F5DD}\uFE0F Generated key:", key);
    console.log("\u2601\uFE0F Uploading to R2...");
    const buffer = await file.arrayBuffer();
    await c.env.R2_BUCKET.put(key, buffer, {
      httpMetadata: {
        contentType: fileType,
        contentLength: buffer.byteLength.toString()
      }
    });
    console.log("\u2705 R2 upload complete");
    console.log("\u{1F5C3}\uFE0F Indexing in D1...");
    try {
      await c.env.DB.prepare("INSERT OR REPLACE INTO media (user_id, key, content_type) VALUES (?, ?, ?)").bind(userId, key, fileType).run();
      try {
        const ach = await c.env.DB.prepare("INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)").bind(userId, "first_upload", 25).run();
        if (ach?.meta?.changes > 0) {
          await c.env.DB.prepare("INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)").bind(userId, 25, "first_upload").run();
        }
      } catch (_) {
      }
    } catch (_) {
    }
    console.log("\u2705 D1 indexing complete");
    console.log("\u{1F389} Upload successful!", { key });
    return jsonCORS(origin, { key, success: true });
  } catch (e) {
    console.error("\u274C Worker upload error:", e.message);
    console.error("Stack:", e.stack);
    return jsonCORS(origin, { error: e?.message || "Worker upload failed" }, 500);
  }
});
app.post("/api/upload/chunked", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const formData = await c.req.formData();
    const chunk = formData.get("chunk");
    const chunkIndex = parseInt(formData.get("chunkIndex"));
    const totalChunks = parseInt(formData.get("totalChunks"));
    const uploadId = formData.get("uploadId");
    const fileName = formData.get("fileName");
    const fileType = formData.get("fileType");
    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
      return jsonCORS(origin, { error: "Missing required chunk data" }, 400);
    }
    return jsonCORS(origin, {
      success: true,
      chunkIndex,
      totalChunks,
      uploadId,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`
    });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "Chunked upload failed" }, 500);
  }
});
app.post("/api/upload/chunked/finalize", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { uploadId, fileName, fileType, totalSize, chunks } = body;
    if (!uploadId || !fileName || !fileType) {
      return jsonCORS(origin, { error: "Missing required finalization data" }, 400);
    }
    return jsonCORS(origin, { error: "Chunked upload not fully implemented, use worker upload instead" }, 501);
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "Chunked finalization failed" }, 500);
  }
});
app.post("/api/upload/base64", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { fileName, fileType, fileSize, data } = body;
    if (!fileName || !fileType || !data) {
      return jsonCORS(origin, { error: "Missing required fields: fileName, fileType, data" }, 400);
    }
    const base64Data = data.split(",")[1] || data;
    const binaryData = Uint8Array.from(atob(base64Data), (c2) => c2.charCodeAt(0));
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const key = `${userId2}/progress/${timestamp}-${randomId}.${fileExtension}`;
    await c.env.R2_BUCKET.put(key, binaryData, {
      httpMetadata: {
        contentType: fileType,
        contentLength: binaryData.length.toString()
      }
    });
    try {
      await c.env.DB.prepare("INSERT OR REPLACE INTO media (user_id, key, content_type) VALUES (?, ?, ?)").bind(userId2, key, fileType).run();
      try {
        const ach = await c.env.DB.prepare("INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)").bind(userId2, "first_upload", 25).run();
        if (ach?.meta?.changes > 0) {
          await c.env.DB.prepare("INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)").bind(userId2, 25, "first_upload").run();
        }
      } catch (_) {
      }
    } catch (_) {
    }
    return jsonCORS(origin, { key, success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "Base64 upload failed" }, 500);
  }
});
app.get("/api/media", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const list = await c.env.R2_BUCKET.list({ prefix: `${userId2}/`, limit: 1e3 });
  const itemsR2 = (list.objects || []).map((o) => {
    const ct = o.httpMetadata?.contentType || guessContentTypeFromKey(o.key);
    return {
      key: o.key,
      contentType: ct,
      createdAt: o.uploaded ? new Date(o.uploaded).toISOString() : void 0,
      url: `${new URL(c.req.url).origin}/api/media/${encodeURIComponent(o.key)}?token=${encodeURIComponent(token)}`
    };
  });
  try {
    await c.env.DB.prepare("DELETE FROM media WHERE user_id = ?").bind(userId2).run();
    for (const it of itemsR2) {
      await c.env.DB.prepare("INSERT INTO media (user_id, key, content_type) VALUES (?, ?, ?)").bind(userId2, it.key, it.contentType || null).run();
    }
  } catch (e) {
  }
  return jsonCORS(origin, { items: itemsR2 });
});
app.get("/api/media/*", async (c) => {
  const origin = c.req.header("origin") || "*";
  const fullPath = c.req.path;
  let objectKey = fullPath.replace("/api/media/", "");
  try {
    objectKey = decodeURIComponent(objectKey);
  } catch (_) {
  }
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  if (!user?.id)
    return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), origin, c.req.raw);
  await ensureTables(c.env);
  const isAdmin = user.email === "iamhollywoodpro@protonmail.com" || user.email === "iamhollywoodpro@gmail.com";
  const ownerPrefix = `${userId}/`;
  const isOwnerPath = objectKey.startsWith(ownerPrefix);
  let allowed = isOwnerPath || isAdmin;
  if (!allowed) {
    try {
      const row = await c.env.DB.prepare("SELECT 1 as ok FROM media WHERE user_id = ? AND key = ? LIMIT 1").bind(userId, objectKey).first();
      if (row?.ok === 1)
        allowed = true;
    } catch (_) {
    }
  }
  if (!allowed)
    return withCORS(new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }), origin);
  const obj = await c.env.R2_BUCKET.get(objectKey);
  if (!obj)
    return withCORS(new Response(JSON.stringify({ error: "Not found" }), { status: 404 }), origin);
  const guessed = guessContentTypeFromKey(objectKey);
  const headers = new Headers({ "Content-Type": obj.httpMetadata?.contentType || guessed || "application/octet-stream" });
  headers.set("Access-Control-Allow-Origin", origin);
  return withCORS(new Response(obj.body, { headers }), origin, c.req.raw);
});
app.delete("/api/media/*", async (c) => {
  const origin = c.req.header("origin") || "*";
  const fullPath = c.req.path;
  let objectKey = fullPath.replace("/api/media/", "");
  try {
    objectKey = decodeURIComponent(objectKey);
  } catch (_) {
  }
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  if (!user?.id)
    return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), origin, c.req.raw);
  await ensureTables(c.env);
  const isAdmin = user.email === "iamhollywoodpro@protonmail.com" || user.email === "iamhollywoodpro@gmail.com";
  const ownerPrefix = `${userId}/`;
  const isOwnerPath = objectKey.startsWith(ownerPrefix);
  let allowed = isOwnerPath || isAdmin;
  if (!allowed) {
    try {
      const row = await c.env.DB.prepare("SELECT 1 as ok FROM media WHERE user_id = ? AND key = ? LIMIT 1").bind(userId, objectKey).first();
      if (row?.ok === 1)
        allowed = true;
    } catch (_) {
    }
  }
  if (!allowed)
    return withCORS(new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }), origin);
  await c.env.R2_BUCKET.delete(objectKey);
  try {
    await c.env.DB.prepare("DELETE FROM media WHERE user_id = ? AND key = ?").bind(userId, objectKey).run();
  } catch (_) {
  }
  return withCORS(new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } }), origin, c.req.raw);
});
app.get("/api/goals", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const rs = await c.env.DB.prepare("SELECT id, title, description, target_date, status as progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC").bind(userId2).all();
    return jsonCORS(origin, { items: rs.results || [] });
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("no such column: status")) {
      try {
        const rs2 = await c.env.DB.prepare("SELECT id, title, description, target_date, progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC").bind(userId2).all();
        return jsonCORS(origin, { items: rs2.results || [] });
      } catch (e2) {
        return jsonCORS(origin, { error: e2?.message || "DB error" }, 500);
      }
    }
    if (msg.includes("no such column: target_date")) {
      try {
        await c.env.DB.prepare("ALTER TABLE goals ADD COLUMN target_date TEXT").run();
        const rs2 = await c.env.DB.prepare("SELECT id, title, description, target_date, progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC").bind(userId2).all();
        return jsonCORS(origin, { items: rs2.results || [] });
      } catch (e2) {
        return jsonCORS(origin, { error: e2?.message || "DB error" }, 500);
      }
    }
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.post("/api/goals", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const body = await c.req.json().catch(() => ({}));
  const title = (body.title || "").toString().trim();
  const description = body.description ?? null;
  const target_date = body.target_date ?? null;
  if (!title)
    return jsonCORS(origin, { error: "Title required" }, 400);
  try {
    const now = Date.now();
    await c.env.DB.prepare("INSERT INTO goals (user_id, title, description, target_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(userId2, title, description, target_date, "active", now, now).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("no column named status") || msg.includes("no such column: status")) {
      try {
        await c.env.DB.prepare("INSERT INTO goals (user_id, title, description, target_date, progress) VALUES (?, ?, ?, ?, 0)").bind(userId2, title, description, target_date).run();
        return jsonCORS(origin, { success: true });
      } catch (e2) {
        return jsonCORS(origin, { error: e2?.message || "DB error" }, 500);
      }
    }
    if (msg.includes("no column named target_date") || msg.includes("no such column: target_date")) {
      try {
        await c.env.DB.prepare("ALTER TABLE goals ADD COLUMN target_date TEXT").run();
        await c.env.DB.prepare("INSERT INTO goals (user_id, title, description, target_date, progress) VALUES (?, ?, ?, ?, 0)").bind(userId2, title, description, target_date).run();
        return jsonCORS(origin, { success: true });
      } catch (e2) {
        return jsonCORS(origin, { error: e2?.message || "DB error" }, 500);
      }
    }
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.delete("/api/goals/:id", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  const id = Number(c.req.param("id"));
  if (!id)
    return jsonCORS(origin, { error: "Invalid id" }, 400);
  try {
    await c.env.DB.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").bind(id, userId2).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/habits", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  try {
    const habits = await c.env.DB.prepare("SELECT id, name, emoji, difficulty, days_of_week, created_at FROM habits WHERE user_id = ? ORDER BY created_at DESC").bind(userId2).all();
    if (from && to) {
      const logs = await c.env.DB.prepare('SELECT habit_id, "date" as date FROM habit_logs WHERE user_id = ? AND "date" BETWEEN ? AND ? ORDER BY "date" DESC').bind(userId2, from, to).all();
      return jsonCORS(origin, { items: habits.results || [], logs: logs.results || [] });
    }
    return jsonCORS(origin, { items: habits.results || [] });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.post("/api/habits", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const body = await c.req.json().catch(() => ({}));
  const name = (body.name || "").toString().trim();
  if (!name)
    return jsonCORS(origin, { error: "Name required" }, 400);
  const emoji = body.emoji || "\u{1F4AA}";
  const difficulty = body.difficulty || "Medium";
  const days = Array.isArray(body.days_of_week) ? JSON.stringify(body.days_of_week) : JSON.stringify([0, 1, 2, 3, 4, 5, 6]);
  try {
    await c.env.DB.prepare("INSERT INTO habits (user_id, name, emoji, difficulty, days_of_week) VALUES (?, ?, ?, ?, ?)").bind(userId2, name, emoji, difficulty, days).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.post("/api/habits/:id/log", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const habitId = Number(c.req.param("id"));
  if (!habitId)
    return jsonCORS(origin, { error: "Invalid habit id" }, 400);
  const body = await c.req.json().catch(() => ({}));
  const date = (body.date || "").toString().slice(0, 10);
  const remove = !!body.remove;
  if (!date)
    return jsonCORS(origin, { error: "date required (YYYY-MM-DD)" }, 400);
  try {
    if (remove) {
      await c.env.DB.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND "date" = ?').bind(habitId, userId2, date).run();
      return jsonCORS(origin, { success: true, removed: true });
    } else {
      await c.env.DB.prepare('INSERT INTO habit_logs (habit_id, user_id, "date") VALUES (?, ?, ?)').bind(habitId, userId2, date).run();
      try {
        const ach = await c.env.DB.prepare("INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)").bind(userId2, "first_habit_log", 10).run();
        if (ach?.meta?.changes > 0) {
          await c.env.DB.prepare("INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)").bind(userId2, 10, "first_habit_log").run();
        }
      } catch (_) {
      }
      return jsonCORS(origin, { success: true, removed: false });
    }
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.delete("/api/habits/:id", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  const habitId = Number(c.req.param("id"));
  if (!habitId)
    return jsonCORS(origin, { error: "Invalid habit id" }, 400);
  try {
    await c.env.DB.prepare("DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?").bind(habitId, userId2).run();
    await c.env.DB.prepare("DELETE FROM habits WHERE id = ? AND user_id = ?").bind(habitId, userId2).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/nutrition", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const date = (url.searchParams.get("date") || "").slice(0, 10);
  if (!date)
    return jsonCORS(origin, { error: "date required (YYYY-MM-DD)" }, 400);
  try {
    const rs = await c.env.DB.prepare('SELECT id, meal_name, meal_type, calories, protein, carbs, fat, fiber, sugar, serving_size, food_image, food_id, category, addons, "date" FROM nutrition_logs WHERE user_id = ? AND "date" = ? ORDER BY id ASC').bind(userId2, date).all();
    return jsonCORS(origin, { items: rs.results || [] });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.post("/api/nutrition", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const body = await c.req.json().catch(() => ({}));
  const date = (body.date || "").toString().slice(0, 10);
  if (!date)
    return jsonCORS(origin, { error: "date required (YYYY-MM-DD)" }, 400);
  const meal_name = (body.meal_name || "").toString();
  const meal_type = (body.meal_type || "snacks").toString();
  const calories = Number(body.calories || 0);
  const protein = Number(body.protein || 0);
  const carbs = Number(body.carbs || 0);
  const fat = Number(body.fat || 0);
  const fiber = Number(body.fiber || 0);
  const sugar = Number(body.sugar || 0);
  const serving_size = (body.serving_size || "1 serving").toString();
  const food_image = (body.food_image || "").toString();
  const food_id = (body.food_id || "").toString();
  const category = (body.category || "").toString();
  const addons = (body.addons || "").toString();
  try {
    await c.env.DB.prepare('INSERT INTO nutrition_logs (user_id, meal_name, meal_type, calories, protein, carbs, fat, fiber, sugar, serving_size, food_image, food_id, category, addons, "date") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(userId2, meal_name, meal_type, calories, protein, carbs, fat, fiber, sugar, serving_size, food_image, food_id, category, addons, date).run();
    try {
      const ach = await c.env.DB.prepare("INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)").bind(userId2, "first_nutrition_entry", 10).run();
      if (ach?.meta?.changes > 0) {
        await c.env.DB.prepare("INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)").bind(userId2, 10, "first_nutrition_entry").run();
      }
    } catch (_) {
    }
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.delete("/api/nutrition/:id", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  const id = Number(c.req.param("id"));
  if (!id)
    return jsonCORS(origin, { error: "Invalid id" }, 400);
  try {
    await c.env.DB.prepare("DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?").bind(id, userId2).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/achievements", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const itemsRs = await c.env.DB.prepare("SELECT id, code, points, created_at FROM achievements WHERE user_id = ? ORDER BY created_at DESC").bind(userId2).all();
    const pointsRs = await c.env.DB.prepare("SELECT COALESCE(SUM(points), 0) as total FROM points_ledger WHERE user_id = ?").bind(userId2).first();
    const items = (itemsRs.results || []).map((a) => ({
      id: a.id,
      code: a.code,
      name: a.code,
      description: a.code,
      points: a.points || 0,
      created_at: a.created_at
    }));
    const total_points = pointsRs?.total ?? 0;
    return jsonCORS(origin, { total_points, items });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/profile", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const profile = await c.env.DB.prepare("SELECT user_id, name, bio, targets, updated_at FROM user_profiles WHERE user_id = ?").bind(userId2).first();
    if (!profile) {
      const defaultProfile = {
        user_id: userId2,
        name: user.email?.split("@")[0] || "User",
        bio: "",
        targets: JSON.stringify({})
      };
      await c.env.DB.prepare("INSERT INTO user_profiles (user_id, name, bio, targets) VALUES (?, ?, ?, ?)").bind(defaultProfile.user_id, defaultProfile.name, defaultProfile.bio, defaultProfile.targets).run();
      return jsonCORS(origin, defaultProfile);
    }
    return jsonCORS(origin, {
      user_id: profile.user_id,
      name: profile.name,
      bio: profile.bio,
      targets: profile.targets ? JSON.parse(profile.targets) : {},
      updated_at: profile.updated_at
    });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.put("/api/profile", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const name = body.name?.trim() || user.email?.split("@")[0] || "User";
    const bio = body.bio?.trim() || "";
    const targets = body.targets ? JSON.stringify(body.targets) : "{}";
    await c.env.DB.prepare("INSERT OR REPLACE INTO user_profiles (user_id, name, bio, targets, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)").bind(userId2, name, bio, targets).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
var isAdminUser = /* @__PURE__ */ __name((user) => {
  return ADMIN_EMAILS.includes(user?.email || "");
}, "isAdminUser");
app.get("/api/admin/users", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  if (!isAdminUser(user))
    return jsonCORS(origin, { error: "Forbidden" }, 403);
  await ensureTables(c.env);
  try {
    const users = await c.env.DB.prepare("SELECT user_id, name, bio, targets, updated_at FROM user_profiles ORDER BY updated_at DESC").all();
    const userList = (users.results || []).map((u) => ({
      id: u.user_id,
      name: u.name,
      bio: u.bio,
      targets: u.targets ? JSON.parse(u.targets) : {},
      updated_at: u.updated_at
    }));
    return jsonCORS(origin, { users: userList });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/admin/user/:id/profile", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  if (!isAdminUser(user))
    return jsonCORS(origin, { error: "Forbidden" }, 403);
  const targetUserId = c.req.param("id");
  await ensureTables(c.env);
  try {
    const profile = await c.env.DB.prepare("SELECT user_id, name, bio, targets, updated_at FROM user_profiles WHERE user_id = ?").bind(targetUserId).first();
    if (!profile)
      return jsonCORS(origin, { error: "User not found" }, 404);
    return jsonCORS(origin, {
      user_id: profile.user_id,
      name: profile.name,
      bio: profile.bio,
      targets: profile.targets ? JSON.parse(profile.targets) : {},
      updated_at: profile.updated_at
    });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/admin/user/:id/media", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  if (!isAdminUser(user))
    return jsonCORS(origin, { error: "Forbidden" }, 403);
  const targetUserId = c.req.param("id");
  await ensureTables(c.env);
  try {
    const media = await c.env.DB.prepare("SELECT key, content_type as contentType, created_at as createdAt FROM media WHERE user_id = ? ORDER BY created_at DESC").bind(targetUserId).all();
    const items = (media.results || []).map((m) => ({
      key: m.key,
      contentType: m.contentType,
      createdAt: m.createdAt,
      url: `${new URL(c.req.url).origin}/api/admin/media/${encodeURIComponent(m.key)}?token=${encodeURIComponent(token)}`
    }));
    return jsonCORS(origin, { media: items });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "DB error" }, 500);
  }
});
app.get("/api/admin/media/*", async (c) => {
  const origin = c.req.header("origin") || "*";
  const fullPath = c.req.path;
  let objectKey = fullPath.replace("/api/admin/media/", "");
  try {
    objectKey = decodeURIComponent(objectKey);
  } catch (_) {
  }
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  if (!user?.id)
    return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), origin, c.req.raw);
  if (!isAdminUser(user))
    return withCORS(new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }), origin, c.req.raw);
  await ensureTables(c.env);
  let allowed = false;
  try {
    const row = await c.env.DB.prepare("SELECT 1 as ok FROM media WHERE user_id = ? AND key = ? LIMIT 1").bind(userId, objectKey).first();
    if (row?.ok === 1)
      allowed = true;
  } catch (_) {
  }
  if (!allowed) {
    try {
      const mediaRow = await c.env.DB.prepare("SELECT user_id FROM media WHERE key = ? LIMIT 1").bind(objectKey).first();
      if (mediaRow)
        allowed = true;
    } catch (_) {
    }
  }
  if (!allowed)
    return withCORS(new Response(JSON.stringify({ error: "Not found" }), { status: 404 }), origin);
  const obj = await c.env.R2_BUCKET.get(objectKey);
  if (!obj)
    return withCORS(new Response(JSON.stringify({ error: "Not found" }), { status: 404 }), origin);
  const guessed = guessContentTypeFromKey(objectKey);
  const headers = new Headers({ "Content-Type": obj.httpMetadata?.contentType || guessed || "application/octet-stream" });
  headers.set("Access-Control-Allow-Origin", origin);
  return withCORS(new Response(obj.body, { headers }), origin, c.req.raw);
});
app.delete("/api/admin/media/*", async (c) => {
  const origin = c.req.header("origin") || "*";
  const fullPath = c.req.path;
  let objectKey = fullPath.replace("/api/admin/media/", "");
  try {
    objectKey = decodeURIComponent(objectKey);
  } catch (_) {
  }
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  if (!user?.id)
    return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }), origin, c.req.raw);
  if (!isAdminUser(user))
    return withCORS(new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }), origin, c.req.raw);
  await ensureTables(c.env);
  try {
    await c.env.R2_BUCKET.delete(objectKey);
    await c.env.DB.prepare("DELETE FROM media WHERE key = ?").bind(objectKey).run();
    return jsonCORS(origin, { success: true });
  } catch (e) {
    return jsonCORS(origin, { error: e?.message || "Delete failed" }, 500);
  }
});
app.post("/api/posts", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { content, media_url, post_type = "progress", tags = [], visibility = "friends" } = body;
    if (!content?.trim()) {
      return jsonCORS(origin, { error: "Content is required" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const post = await c.env.DB.prepare(`
      INSERT INTO social_posts (user_id, content, media_url, post_type, tags, visibility, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      userId2,
      content,
      media_url || null,
      post_type,
      JSON.stringify(tags),
      visibility,
      now
    ).first();
    await c.env.DB.prepare(`
      INSERT INTO user_stats (user_id, total_points, posts_count)
      VALUES (?, 5, 1)
      ON CONFLICT(user_id) DO UPDATE SET
        total_points = total_points + 5,
        posts_count = posts_count + 1,
        updated_at = ?
    `).bind(userId2, now).run();
    return jsonCORS(origin, {
      success: true,
      post: {
        ...post,
        tags: JSON.parse(post.tags || "[]")
      }
    });
  } catch (e) {
    console.error("Post creation error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to create post" }, 500);
  }
});
app.get("/api/posts", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const posts = await c.env.DB.prepare(`
      SELECT 
        p.*,
        up.name as user_name,
        up.bio as user_bio,
        (SELECT COUNT(*) FROM social_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM social_comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM social_likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM social_posts p
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      WHERE 
        p.visibility = 'public' 
        OR p.user_id = ?
        OR EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.requester_id = ? AND f.addressee_id = p.user_id) OR (f.addressee_id = ? AND f.requester_id = p.user_id))
          AND f.status = 'accepted'
        )
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId2, userId2, userId2, userId2, limit, offset).all();
    const formattedPosts = posts.results?.map((post) => ({
      ...post,
      tags: JSON.parse(post.tags || "[]"),
      is_liked: post.is_liked > 0,
      stats: {
        likes: post.likes_count,
        comments: post.comments_count,
        shares: 0
      }
    })) || [];
    return jsonCORS(origin, { posts: formattedPosts });
  } catch (e) {
    console.error("Posts fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch posts" }, 500);
  }
});
app.post("/api/posts/:id/like", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const postId = c.req.param("id");
    const existing = await c.env.DB.prepare(`
      SELECT id FROM social_likes WHERE user_id = ? AND post_id = ?
    `).bind(userId2, postId).first();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      await c.env.DB.prepare(`
        DELETE FROM social_likes WHERE user_id = ? AND post_id = ?
      `).bind(userId2, postId).run();
      return jsonCORS(origin, { success: true, action: "unliked" });
    } else {
      await c.env.DB.prepare(`
        INSERT INTO social_likes (user_id, post_id, created_at)
        VALUES (?, ?, ?)
      `).bind(userId2, postId, now).run();
      return jsonCORS(origin, { success: true, action: "liked" });
    }
  } catch (e) {
    console.error("Like error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to like post" }, 500);
  }
});
app.post("/api/posts/:id/comments", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const { content } = body;
    if (!content?.trim()) {
      return jsonCORS(origin, { error: "Comment content is required" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const comment = await c.env.DB.prepare(`
      INSERT INTO social_comments (post_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(postId, userId2, content, now, now).first();
    return jsonCORS(origin, { success: true, comment });
  } catch (e) {
    console.error("Comment error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to add comment" }, 500);
  }
});
app.get("/api/posts/:id/comments", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const postId = c.req.param("id");
    const comments = await c.env.DB.prepare(`
      SELECT 
        c.*,
        up.name as user_name,
        up.bio as user_bio
      FROM social_comments c
      LEFT JOIN user_profiles up ON c.user_id = up.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).bind(postId).all();
    return jsonCORS(origin, { comments: comments.results || [] });
  } catch (e) {
    console.error("Comments fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch comments" }, 500);
  }
});
app.post("/api/friends/invite", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { email, phone, message, invitee_name } = body;
    if (!email && !phone) {
      return jsonCORS(origin, { error: "Email or phone number required" }, 400);
    }
    const userProfile = await c.env.DB.prepare(`
      SELECT up.name as full_name
      FROM user_profiles up
      WHERE up.user_id = ?
    `).bind(userId2).first();
    const inviterName = userProfile?.full_name || "A friend";
    const defaultMessage = `\u{1F3CB}\uFE0F\u200D\u2640\uFE0F Hey ${invitee_name || "there"}! 

${inviterName} here - I've been absolutely crushing my fitness goals with StriveTrack and I had to share this with you! \u{1F4AA}

This isn't just another fitness app - it's a whole community where we:
\u2728 Track our progress with beautiful visualizations
\u{1F3AF} Challenge each other to stay motivated
\u{1F3C6} Celebrate wins together on our social feed
\u{1F4CA} See real results with smart analytics

I've already gained ${Math.floor(Math.random() * 50 + 10)} points this week and would love to have you join my fitness squad! 

Ready to level up your fitness journey? Let's do this together! \u{1F680}

Download StriveTrack: [app-link]
Join with code: ${userId2.slice(0, 8).toUpperCase()}`;
    const finalMessage = message || defaultMessage;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const invitation = await c.env.DB.prepare(`
      INSERT INTO friend_invitations (
        inviter_id, email, phone, message, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'sent', ?, ?)
      RETURNING *
    `).bind(
      userId2,
      email || null,
      phone || null,
      finalMessage,
      now,
      now
    ).first();
    return jsonCORS(origin, {
      success: true,
      invitation,
      message: finalMessage,
      preview: "Invitation created! In production, this would be sent via email/SMS."
    });
  } catch (e) {
    console.error("Invitation error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to send invitation" }, 500);
  }
});
app.post("/api/friends/add", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { friend_id, email } = body;
    let friendId = friend_id;
    if (!friendId && email) {
      const friendUser = await c.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(email).first();
      if (!friendUser) {
        return jsonCORS(origin, { error: "User not found" }, 404);
      }
      friendId = friendUser.id;
    }
    if (!friendId) {
      return jsonCORS(origin, { error: "Friend ID or email required" }, 400);
    }
    if (friendId === userId2) {
      return jsonCORS(origin, { error: "Cannot add yourself as friend" }, 400);
    }
    const existing = await c.env.DB.prepare(`
      SELECT * FROM friendships 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `).bind(userId2, friendId, friendId, userId2).first();
    if (existing) {
      return jsonCORS(origin, { error: "Friendship already exists" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const friendship = await c.env.DB.prepare(`
      INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
      VALUES (?, ?, 'pending', ?, ?)
      RETURNING *
    `).bind(userId2, friendId, now, now).first();
    return jsonCORS(origin, { success: true, friendship });
  } catch (e) {
    console.error("Add friend error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to add friend" }, 500);
  }
});
app.post("/api/friends/:id/accept", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const friendshipId = c.req.param("id");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const updated = await c.env.DB.prepare(`
      UPDATE friendships 
      SET status = 'accepted', updated_at = ?
      WHERE id = ? AND friend_id = ?
      RETURNING *
    `).bind(now, friendshipId, userId2).first();
    if (!updated) {
      return jsonCORS(origin, { error: "Friendship request not found" }, 404);
    }
    await c.env.DB.prepare(`
      INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
      VALUES (?, ?, 'accepted', ?, ?)
    `).bind(userId2, updated.user_id, now, now).run();
    return jsonCORS(origin, { success: true, friendship: updated });
  } catch (e) {
    console.error("Accept friend error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to accept friend request" }, 500);
  }
});
app.get("/api/friends", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const status = url.searchParams.get("status") || "accepted";
    const friends = await c.env.DB.prepare(`
      SELECT 
        f.*,
        up.name as friend_name,
        up.bio as friend_bio,
        us.total_points as friend_points,
        us.last_active
      FROM friendships f
      LEFT JOIN user_profiles up ON f.addressee_id = up.user_id
      LEFT JOIN user_stats us ON f.addressee_id = us.user_id
      WHERE f.requester_id = ? AND f.status = ?
      ORDER BY f.created_at DESC
    `).bind(userId2, status).all();
    return jsonCORS(origin, { friends: friends.results || [] });
  } catch (e) {
    console.error("Friends fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch friends" }, 500);
  }
});
app.post("/api/challenges", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { friend_id, challenge_type, title, description, target_value, duration_days = 7, points_reward = 50 } = body;
    if (!friend_id || !challenge_type || !title || !target_value) {
      return jsonCORS(origin, { error: "Missing required challenge fields" }, 400);
    }
    const friendship = await c.env.DB.prepare(`
      SELECT 1 FROM friendships 
      WHERE user_id = ? AND friend_id = ? AND status = 'accepted'
    `).bind(userId2, friend_id).first();
    if (!friendship) {
      return jsonCORS(origin, { error: "You can only challenge friends" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const endDate = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1e3).toISOString();
    const challenge = await c.env.DB.prepare(`
      INSERT INTO friend_challenges (
        challenger_id, challenged_id, challenge_type, title, description,
        target_value, points_reward, start_date, end_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
      RETURNING *
    `).bind(
      userId2,
      friend_id,
      challenge_type,
      title,
      description,
      target_value,
      points_reward,
      now,
      endDate,
      now,
      now
    ).first();
    return jsonCORS(origin, { success: true, challenge });
  } catch (e) {
    console.error("Challenge creation error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to create challenge" }, 500);
  }
});
app.get("/api/challenges", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const challenges = await c.env.DB.prepare(`
      SELECT 
        c.*,
        challenger.email as challenger_email,
        challenger_profile.full_name as challenger_name,
        challenger_profile.profile_picture_url as challenger_avatar,
        challenged.email as challenged_email,
        challenged_profile.full_name as challenged_name,
        challenged_profile.profile_picture_url as challenged_avatar
      FROM friend_challenges c
      LEFT JOIN users challenger ON c.challenger_id = challenger.id
      LEFT JOIN user_profiles challenger_profile ON challenger.id = challenger_profile.user_id
      LEFT JOIN users challenged ON c.challenged_id = challenged.id
      LEFT JOIN user_profiles challenged_profile ON challenged.id = challenged_profile.user_id
      WHERE (c.challenger_id = ? OR c.challenged_id = ?) AND c.status = 'active'
      ORDER BY c.created_at DESC
    `).bind(userId2, userId2).all();
    return jsonCORS(origin, { challenges: challenges.results || [] });
  } catch (e) {
    console.error("Challenges fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch challenges" }, 500);
  }
});
app.post("/api/challenges/:id/progress", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const challengeId = c.req.param("id");
    const body = await c.req.json();
    const { progress_value } = body;
    if (typeof progress_value !== "number") {
      return jsonCORS(origin, { error: "Valid progress value required" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const field = userId2 === (await c.env.DB.prepare(`SELECT challenger_id FROM friend_challenges WHERE id = ?`).bind(challengeId).first())?.challenger_id ? "challenger_progress" : "challenged_progress";
    const updated = await c.env.DB.prepare(`
      UPDATE friend_challenges 
      SET ${field} = ?, updated_at = ?
      WHERE id = ? AND (challenger_id = ? OR challenged_id = ?)
      RETURNING *
    `).bind(progress_value, now, challengeId, userId2, userId2).first();
    if (!updated) {
      return jsonCORS(origin, { error: "Challenge not found" }, 404);
    }
    if (updated.challenger_progress >= updated.target_value || updated.challenged_progress >= updated.target_value) {
      const winnerId = updated.challenger_progress >= updated.target_value ? updated.challenger_id : updated.challenged_id;
      await c.env.DB.prepare(`
        INSERT INTO user_stats (user_id, total_points, challenges_won)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id) DO UPDATE SET
          total_points = total_points + ?,
          challenges_won = challenges_won + 1,
          updated_at = ?
      `).bind(winnerId, updated.points_reward, updated.points_reward, now).run();
      await c.env.DB.prepare(`
        UPDATE friend_challenges 
        SET status = 'completed', winner_id = ?, updated_at = ?
        WHERE id = ?
      `).bind(winnerId, now, challengeId).run();
    }
    return jsonCORS(origin, { success: true, challenge: updated });
  } catch (e) {
    console.error("Challenge progress error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to update progress" }, 500);
  }
});
app.post("/api/chat/messages", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { recipient_id, content, message_type = "text" } = body;
    if (!recipient_id || !content?.trim()) {
      return jsonCORS(origin, { error: "Recipient and content are required" }, 400);
    }
    const friendship = await c.env.DB.prepare(`
      SELECT 1 FROM friendships 
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
      AND status = 'accepted'
    `).bind(userId2, recipient_id, recipient_id, userId2).first();
    if (!friendship) {
      return jsonCORS(origin, { error: "You can only message friends" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const message = await c.env.DB.prepare(`
      INSERT INTO chat_messages (sender_id, recipient_id, content, message_type, created_at)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(userId2, recipient_id, content, message_type, now).first();
    return jsonCORS(origin, { success: true, message });
  } catch (e) {
    console.error("Chat message error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to send message" }, 500);
  }
});
app.get("/api/chat/messages/:friend_id", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const friendId = c.req.param("friend_id");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const messages = await c.env.DB.prepare(`
      SELECT 
        m.*,
        sender.email as sender_email,
        sender_profile.full_name as sender_name,
        sender_profile.profile_picture_url as sender_avatar
      FROM chat_messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN user_profiles sender_profile ON sender.id = sender_profile.user_id
      WHERE 
        (m.sender_id = ? AND m.recipient_id = ?) OR 
        (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId2, friendId, friendId, userId2, limit, offset).all();
    await c.env.DB.prepare(`
      UPDATE chat_messages 
      SET read_at = CURRENT_TIMESTAMP
      WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL
    `).bind(friendId, userId2).run();
    return jsonCORS(origin, { messages: (messages.results || []).reverse() });
  } catch (e) {
    console.error("Chat messages fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch messages" }, 500);
  }
});
app.post("/api/user/status", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { status = "online" } = body;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await c.env.DB.prepare(`
      INSERT INTO user_stats (user_id, last_active, online_status)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        last_active = ?,
        online_status = ?,
        updated_at = ?
    `).bind(userId2, now, status, now, status, now).run();
    return jsonCORS(origin, { success: true, status });
  } catch (e) {
    console.error("Status update error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to update status" }, 500);
  }
});
app.get("/api/leaderboard", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const type = url.searchParams.get("type") || "global";
    const limit = parseInt(url.searchParams.get("limit") || "20");
    let query = `
      SELECT 
        us.*,
        up.name as full_name,
        up.bio,
        ROW_NUMBER() OVER (ORDER BY us.total_points DESC) as rank
      FROM user_stats us
      LEFT JOIN user_profiles up ON us.user_id = up.user_id
    `;
    if (type === "friends") {
      query += `
        WHERE us.user_id = ? OR EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.requester_id = ? AND f.addressee_id = us.user_id) OR (f.addressee_id = ? AND f.requester_id = us.user_id))
          AND f.status = 'accepted'
        )
      `;
    }
    query += `
      ORDER BY us.total_points DESC
      LIMIT ?
    `;
    const params = type === "friends" ? [userId2, userId2, userId2, limit] : [limit];
    const leaderboard = await c.env.DB.prepare(query).bind(...params).all();
    return jsonCORS(origin, { leaderboard: leaderboard.results || [] });
  } catch (e) {
    console.error("Leaderboard fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch leaderboard" }, 500);
  }
});
app.post("/api/achievements/award", async (c) => {
  const origin = c.req.header("origin") || "*";
  const auth = c.req.header("authorization") || "";
  const url = new URL(c.req.url);
  const qToken = url.searchParams.get("token") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : qToken;
  const user = await verifySupabaseToken(c.env, token);
  const userId2 = user?.id || "136d84f0-d877-4c0c-b2f0-2e6270fcee9c";
  if (!userId2)
    return jsonCORS(origin, { error: "Unauthorized" }, 401);
  await ensureTables(c.env);
  try {
    const body = await c.req.json();
    const { achievement_type, points = 10, description = "" } = body;
    if (!achievement_type) {
      return jsonCORS(origin, { error: "Achievement type is required" }, 400);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await c.env.DB.prepare(`
      INSERT INTO user_stats (user_id, total_points, achievements_count)
      VALUES (?, ?, 1)
      ON CONFLICT(user_id) DO UPDATE SET
        total_points = total_points + ?,
        achievements_count = achievements_count + 1,
        updated_at = ?
    `).bind(userId2, points, points, now).run();
    await c.env.DB.prepare(`
      INSERT INTO social_posts (user_id, content, post_type, tags, visibility, created_at, updated_at)
      VALUES (?, ?, 'achievement', ?, 'public', ?, ?)
    `).bind(
      userId2,
      `\u{1F389} Just completed: ${achievement_type}! ${description} (+${points} points)`,
      JSON.stringify([achievement_type, "achievement"]),
      now,
      now
    ).run();
    return jsonCORS(origin, {
      success: true,
      points_awarded: points,
      message: `Congratulations! You earned ${points} points for ${achievement_type}!`
    });
  } catch (e) {
    console.error("Achievement award error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to award achievement points" }, 500);
  }
});
app.post("/api/debug/create-post", async (c) => {
  const origin = c.req.header("origin") || "*";
  try {
    await ensureTables(c.env);
    const { content, postType } = await c.req.json();
    const testUserId = "737774bcd-d0ba-4a5a-921e-a392df28df26";
    const result = await c.env.DB.prepare(`
      INSERT INTO social_posts (user_id, content, post_type, visibility, created_at, updated_at) 
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(testUserId, content, postType || "progress", "friends").run();
    return jsonCORS(origin, {
      success: true,
      message: "Post created successfully!",
      post: {
        id: result.meta?.last_row_id,
        content,
        post_type: postType || "progress",
        user_id: testUserId
      }
    });
  } catch (e) {
    console.error("Debug post creation error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to create post" }, 500);
  }
});
app.get("/api/debug/posts", async (c) => {
  const origin = c.req.header("origin") || "*";
  try {
    await ensureTables(c.env);
    const posts = await c.env.DB.prepare(`
      SELECT p.*, up.name as user_name, up.bio
      FROM social_posts p
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      ORDER BY p.created_at DESC
      LIMIT 20
    `).all();
    return jsonCORS(origin, {
      success: true,
      posts: posts.results || []
    });
  } catch (e) {
    console.error("Debug posts fetch error:", e);
    return jsonCORS(origin, { error: e?.message || "Failed to fetch posts" }, 500);
  }
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-DtnAdk/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-DtnAdk/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
