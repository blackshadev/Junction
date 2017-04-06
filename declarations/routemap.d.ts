import { IDictionary } from "./collections";
import { Endpoint, Endpoints } from "./endpoints";
import { HttpVerb } from "./http";
import { RoutingState } from "./route_search";
export declare enum RouteType {
    unknown = 0,
    static = 1,
    parameter = 2,
    wildcard = 3,
}
export interface IRoutes {
    [name: string]: Route;
}
export interface IRouteMap {
    routes: IRoutes;
    addEndpoint(verbs: HttpVerb[], fname: any, data: any): any;
}
export declare abstract class Route implements IRouteMap {
    static allVerbs: HttpVerb[];
    static Create(urlPart: string): Route;
    static normalizeURL(url: string): string;
    static splitURL(url: string): [HttpVerb[], string[]];
    private static urlRegexp;
    type: RouteType;
    name: string;
    routes: IRoutes;
    endpoints: Endpoints;
    constructor(name: string);
    abstract match(urlPart: string, restUrl: string): boolean;
    addEndpoint(verbs: HttpVerb[], endpoint: Endpoint<any, any>): void;
}
export declare class StaticRoute extends Route {
    type: RouteType;
    match(urlPart: string, restUrl: string): boolean;
}
export declare class ParameterRoute extends Route {
    static parameterRegExp: RegExp;
    type: RouteType;
    match(urlPart: string, restUrl: string): boolean;
}
export declare class WildcardRoute extends Route {
    regex: RegExp;
    type: RouteType;
    constructor(name: string);
    match(urlPart: string, restUrl: string): boolean;
}
export interface IUserRoutes {
    [route: string]: string;
}
export interface IRoutingResult {
    path: string[];
    params: IDictionary<string>;
    resource: Endpoint<any, any>;
    uri: string;
}
export declare abstract class Router {
    readonly root: Route;
    constructor();
    abstract addRoute(url: string, endpoint: Endpoint<any, any>): any;
    abstract searchRoute(verb: HttpVerb, url: string): Promise<RoutingState>;
    getRoute(url: string, verb: HttpVerb): Promise<IRoutingResult>;
}
export declare class StaticRouter extends Router {
    readonly routes: IRoutes;
    addRoute(url: string, endpoint: Endpoint<any, any>): void;
    searchRoute(verb: HttpVerb, url: string): Promise<RoutingState>;
}
