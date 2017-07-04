"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const https_1 = require("https");
const url_1 = require("url");
const BufferReader_1 = require("./BufferReader");
const endpoints_1 = require("./endpoints");
const errno_1 = require("./errno");
const index_1 = require("./index");
var HttpVerb;
(function (HttpVerb) {
    HttpVerb[HttpVerb["NONE"] = 0] = "NONE";
    HttpVerb[HttpVerb["GET"] = 1] = "GET";
    HttpVerb[HttpVerb["POST"] = 2] = "POST";
    HttpVerb[HttpVerb["PUT"] = 4] = "PUT";
    HttpVerb[HttpVerb["DELETE"] = 8] = "DELETE";
    HttpVerb[HttpVerb["UPGRADE"] = 16] = "UPGRADE";
    HttpVerb[HttpVerb["TRACE"] = 32] = "TRACE";
    HttpVerb[HttpVerb["HEAD"] = 64] = "HEAD";
    HttpVerb[HttpVerb["OPTIONS"] = 128] = "OPTIONS";
    HttpVerb[HttpVerb["UPDATE"] = 256] = "UPDATE";
})(HttpVerb = exports.HttpVerb || (exports.HttpVerb = {}));
exports.allVerbs = (() => {
    const arr = [];
    for (const k in HttpVerb) {
        if (HttpVerb[k] !== HttpVerb.NONE && typeof (HttpVerb.GET) !== typeof (HttpVerb[k])) {
            continue;
        }
        arr.push(HttpVerb[k]);
    }
    return arr;
})();
function parseHttpVerb(verb) {
    const v = HttpVerb[verb];
    if (typeof (HttpVerb.GET) !== typeof (v)) {
        throw new Error("Invalid HttpVerb");
    }
    return v;
}
exports.parseHttpVerb = parseHttpVerb;
class HttpRequest {
    get url() { return this._req.url; }
    get method() { return this._req.method; }
    get parameters() { return this._parameters; }
    get headers() { return this._req.headers; }
    get ctx() { return this._ctx; }
    get uri() { return this._uri; }
    get queryParams() { return this._queryParameters; }
    get request() { return this._req; }
    constructor(ctx, route, req) {
        this._ctx = ctx;
        this._req = req;
        this._parameters = route.params;
        this._uri = route.uri;
        this._reader = new BufferReader_1.BufferReader(parseInt(this.header("content-length"), 10), req);
        this.parseUrl();
    }
    readBody(cb) {
        if (cb) {
            this._reader.read(cb);
        }
        else {
            return new Promise((resolve, reject) => {
                this._reader.read((dat) => resolve(dat));
            });
        }
    }
    readString(encoding = "utf8", cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let err;
            let str;
            try {
                const b = yield this.readBody();
                str = b.toString(encoding);
            }
            catch (_err) {
                err = _err;
            }
            if (cb) {
                cb(err, str);
            }
            else if (err) {
                throw err;
            }
            else {
                return str;
            }
        });
    }
    readJSON(encoding, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let err;
            let obj;
            try {
                const str = yield this.readString(encoding);
                obj = JSON.parse(str);
            }
            catch (_err) {
                err = _err;
            }
            if (cb) {
                cb(err, obj);
            }
            else if (err) {
                throw err;
            }
            else {
                return obj;
            }
        });
    }
    header(headerName) { return this._req.headers[headerName]; }
    queryParameter(paramName) { return this._queryParameters[paramName]; }
    parameter(paramName) { return this._parameters[paramName]; }
    parseUrl() {
        const oPar = url_1.parse(this._req.url, true);
        this._queryString = oPar.search;
        this._queryParameters = oPar.query;
    }
}
exports.HttpRequest = HttpRequest;
class HttpResponse {
    constructor(ctx, resp) {
        this._statusCode = 200;
        this._encoding = "utf8";
        this.eos = false;
        this._ctx = ctx;
        this._resp = resp;
        this._headers = {};
        this._startTime = Date.now();
    }
    get response() { return this._resp; }
    set contentType(val) { this._headers["Content-Type"] = val; }
    get statusCode() { return this._statusCode; }
    get length() {
        return typeof (this._data) === "string" ? Buffer.byteLength(this._data) : this._data.length;
    }
    get headers() {
        return Object.assign({}, this._headers);
    }
    get ctx() { return this._ctx; }
    status(code) {
        this._statusCode = code;
    }
    header(headerName, value) {
        this._headers[headerName] = value;
    }
    data(dat) {
        const bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
            this.header("Content-Type", "application/json");
        }
        this._data = dat;
    }
    append(dat) {
        const bin = dat instanceof Buffer;
        if (!bin && typeof (dat) === "object") {
            dat = JSON.stringify(dat);
        }
        if (bin && this._data instanceof Buffer) {
            Buffer.concat([this._data, dat]);
        }
        else {
            this._data += dat.toString();
        }
    }
    send() {
        if (this.eos) {
            return this._ctx.server.log("server", "Request already send");
        }
        const len = typeof (this._data) === "string" ?
            Buffer.byteLength(this._data, this._encoding) :
            this._data.length;
        this._headers["Content-Length"] = len + "";
        this._headers.Date = new Date().toUTCString();
        this._resp.writeHead(this._statusCode, this._headers);
        this._resp.end(this._data);
        this.eos = true;
        const t = Date.now() - this._startTime;
        this._ctx.server.log("server", " send: " + typeof (this._data) +
            " of length " + len + " bytes, took " + t + "ms");
    }
    getData() {
        return this._data;
    }
}
exports.HttpResponse = HttpResponse;
class HttpError {
    constructor(err, errtxt, extra) {
        this.statuscode = 500;
        if (err.statuscode !== undefined) {
            this.statuscode = err.statuscode;
            this.text = err.text || err.message;
            this.extra = err.extra;
        }
        else if (err instanceof Error) {
            const errDescr = HttpError.translateErrNo(err.errno);
            this.statuscode = errDescr && errDescr.http ? errDescr.http : 500;
            this.text = errDescr ? errDescr.description : err.name;
            this.extra = err.toString();
        }
        else if (typeof (err) === "number") {
            this.statuscode = err;
            this.text = errtxt ? errtxt : HttpError.httpStatusText(this.statuscode);
            if (extra) {
                this.extra = extra;
            }
        }
    }
    static translateErrNo(no) { return errno_1.errno[no]; }
    static httpStatusText(no) {
        return http_1.STATUS_CODES[no];
    }
    send(ctx) {
        ctx.response.status(this.statuscode);
        ctx.response.data("<h1>" + this.statuscode + " " + this.text + "</h1>");
        if (this.extra) {
            ctx.response.append(this.extra);
        }
        ctx.response.send();
    }
}
exports.HttpError = HttpError;
class HttpContext {
    get userData() { return this._server.userData; }
    get url() { return this.request.url; }
    get method() { return this.request.method; }
    get server() { return this._server; }
    constructor(serv, route, req, resp) {
        this._server = serv;
        this.route = route;
        this.request = new HttpRequest(this, route, req);
        this.response = new HttpResponse(this, resp);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.route.resource) {
                try {
                    return this.route.resource.execute(this);
                }
                catch (err) {
                    this.error(err);
                }
            }
            else {
                this.error(404);
            }
        });
    }
    error(err, errtxt, extra) {
        const error = new HttpError(err, errtxt, extra);
        if (this._server.onError) {
            this._server.onError(error, this);
        }
        else {
            error.send(this);
        }
    }
    cwd() { return this._server.cwd; }
}
exports.HttpContext = HttpContext;
function WebMethod(route, oPar) {
    oPar = oPar || {};
    oPar.server = oPar.server || RoadieServer.default;
    return function (target, method, descr) {
        if (typeof (descr.value) !== "function") {
            throw new Error(`Given WebMethod ${method} is not a function`);
        }
        const endpoint = new endpoints_1.WebMethodEndpoint(target.constructor, method, oPar.data);
        oPar.server.addRoute(route, endpoint);
    };
}
exports.WebMethod = WebMethod;
class RoadieServer {
    constructor(oPar) {
        this._port = 80;
        this._rootDir = process.cwd();
        this._webserviceDir = "webservices";
        this._connections = {};
        this._port = oPar.port !== undefined ? oPar.port : oPar.tlsOptions !== undefined ? 443 : 80;
        this._host = oPar.host || this._host;
        this._webserviceDir = oPar.webserviceDir || this.webserviceDir;
        this._rootDir = oPar.root || this._rootDir;
        this._verbose = !!oPar.verbose;
        this.router = oPar.router || new index_1.StaticRouter();
        this._userData = oPar.userData;
        this._includeHostname = !!oPar.includeHostname;
        if (!this._verbose) {
            this.log = () => { };
        }
        this._tlsOptions = oPar.tlsOptions;
        this._server = this.createServer();
    }
    get port() { return this._port; }
    get host() { return this._host; }
    get cwd() { return this._rootDir; }
    get webserviceDir() { return this._rootDir + "/" + this._webserviceDir; }
    get useHttps() { return !!this._tlsOptions; }
    get userData() { return this._userData; }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._server.listen(this._port, this._host, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._server.close((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
                for (const key in this._connections) {
                    if (this._connections.hasOwnProperty(key)) {
                        this._connections[key].destroy();
                    }
                }
            });
        });
    }
    getRoute(url, verb, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.router.getRoute(url, verb, hostname);
        });
    }
    include(svcFile, isAbsolute) {
        require(!isAbsolute ? (this.webserviceDir + "/" + svcFile + ".js") : svcFile);
    }
    addRoute(route, endpoint, data) {
        const endp = endpoint instanceof endpoints_1.Endpoint ?
            endpoint :
            endpoints_1.Endpoint.Create(endpoint, data);
        this.router.addRoute(route, endp);
    }
    log(...args) {
        console.log.apply(console, args);
    }
    addRoutes(routes) {
        if (routes instanceof Array) {
            for (const route of routes) {
                this.addRoutes(route);
            }
            return;
        }
        if (typeof (routes) === "string") {
            routes = require(`${this._rootDir}/${routes}`);
        }
        if (typeof (routes) !== "object") {
            throw new Error("Invalid route argument given");
        }
        for (const k in routes) {
            if (routes.hasOwnProperty(k)) {
                this.addRoute(k, routes[k]);
            }
        }
    }
    addConnection(sock) {
        const key = sock.remoteAddress + ":" + sock.remotePort;
        this._connections[key] = sock;
        sock.on("close", () => delete this._connections[key]);
    }
    createServer() {
        const _h = (req, resp) => __awaiter(this, void 0, void 0, function* () {
            try {
                const verb = parseHttpVerb(req.method);
                const path = url_1.parse(req.url).pathname;
                const route = yield this.getRoute(path, verb, this._includeHostname ? req.headers.host : undefined);
                const ctx = new HttpContext(this, route, req, resp);
                yield ctx.execute();
            }
            catch (e) {
                resp.statusCode = 500;
                resp.setHeader("Content-Type", "text/html");
                resp.end(`<h1> Unkown server error occurred </h1><pre>${e.toString()}</pre>`);
            }
        });
        let serv;
        if (this.useHttps) {
            serv = https_1.createServer(this._tlsOptions, _h);
        }
        else {
            serv = http_1.createServer(_h);
        }
        serv.on("connection", (s) => this.addConnection(s));
        return serv;
    }
}
exports.RoadieServer = RoadieServer;
//# sourceMappingURL=http.js.map