import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { BufferReader } from "./BufferReader";
import { IDictionary } from "./collections";
import { IError } from "./errno";
import { RouteMap, IRoutingResult } from "./routemap";
import { WebFunction, Endpoint } from "./endpoints";
export declare enum HttpVerb {
    "GET" = 0,
    "POST" = 1,
    "PUT" = 2,
    "DELETE" = 3,
    "UPGRADE" = 4,
    "TRACE" = 5,
    "HEAD" = 6,
    "OPTIONS" = 7,
    "UPDATE" = 8,
}
export declare function parseHttpVerb(verb: string): HttpVerb;
export declare class HttpRequest {
    url: string;
    method: string;
    parameters: IDictionary<string>;
    ctx: HttpContext;
    uri: string;
    queryParams: IDictionary<string>;
    protected _parameters: IDictionary<string>;
    protected _req: IncomingMessage;
    protected _reader: BufferReader;
    protected _ctx: HttpContext;
    protected _uri: string;
    protected _queryString: string;
    protected _queryParameters: IDictionary<string>;
    constructor(ctx: HttpContext, route: IRoutingResult, req: IncomingMessage);
    private parseUrl();
    readBody(cb: (data: Buffer) => void): void;
    header(headerName: string): string;
    queryParameter(paramName: string): string;
    parameter(paramName: string): string;
}
export declare class HttpResponse {
    protected resp: ServerResponse;
    protected statusCode: number;
    protected headers: {
        [name: string]: string;
    };
    private eos;
    protected _encoding: string;
    protected _data: Buffer | string;
    protected _startTime: number;
    protected _ctx: HttpContext;
    ctx: HttpContext;
    constructor(ctx: HttpContext, resp: ServerResponse);
    status(code: number): void;
    contentType: string;
    header(headerName: string, value: string): void;
    data(dat: Buffer | string | Object): void;
    append(dat: Buffer | string): void;
    send(): void;
}
export interface IHttpError {
    extra?: string;
    text?: string;
    code: number;
}
export declare class HttpError implements IHttpError {
    extra: string;
    text: string;
    code: number;
    constructor(err: IHttpError | Error | number, errtxt?: string, extra?: string);
    send(ctx: HttpContext): void;
    static translateErrNo(no: number): IError;
    static httpStatusText(no: string | number): string;
}
export declare class HttpContext {
    request: HttpRequest;
    response: HttpResponse;
    route: IRoutingResult;
    url: string;
    method: string;
    server: RoadieServer;
    protected _server: RoadieServer;
    constructor(serv: RoadieServer, route: IRoutingResult, req: IncomingMessage, resp: ServerResponse);
    execute(): void;
    error(err: IHttpError | Error | number, errtxt?: string, extra?: string): void;
    cwd(): string;
}
export declare type ErrorHandle = (err: HttpError, ctx: HttpContext) => void;
export interface IRoadieServerParameters {
    port?: number;
    host?: string;
    root?: string;
    webserviceDir?: string;
    tlsOptions?: {};
    onError?: (err: HttpError, ctx: HttpContext) => void;
}
export interface IRoutes {
    [route: string]: WebFunction | string;
}
export declare type WebMethodDecorator = (target: any, method: string, descr: TypedPropertyDescriptor<Function>) => void;
export interface IWebMethodParams {
    data?: {};
    server?: RoadieServer;
}
export declare function WebMethod(route: string, oPar?: IWebMethodParams): WebMethodDecorator;
export declare class RoadieServer {
    static Default: RoadieServer;
    protected _port: number;
    port: number;
    protected _host: string;
    host: string;
    cwd: string;
    webserviceDir: string;
    useHttps: boolean;
    protected _rootDir: string;
    protected _webserviceDir: string;
    protected _tlsOptions: {};
    protected _server: HttpsServer | HttpServer;
    protected _routemap: RouteMap;
    constructor(oPar: IRoadieServerParameters);
    protected createServer(): HttpsServer | HttpServer;
    onError: ErrorHandle;
    start(): void;
    getRoute(url: string, verb: HttpVerb): IRoutingResult;
    addRoute(route: string, endpoint: WebFunction | string | Endpoint<any, any>, data?: any): void;
    addRoutes(routes: any): void;
}
