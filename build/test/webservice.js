"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const assert = require("assert");
const webservice_1 = require("../webservice");
const http_1 = require("../http");
const endpoints_1 = require("../endpoints");
class NewWebservice extends webservice_1.WebService {
    constructor(ctx, method) {
        super(ctx, method);
        this.isReady = false;
        this.extraProp = true;
    }
    test() {
        this.ctx.response.data("New Test Webservice");
        this.ctx.response.send();
    }
}
describe("Webservice", () => {
    it("extending old", () => {
        let constructed = false;
        let svc = webservice_1.WebService.extend({
            create: function (ctx, method) {
                constructed = true;
                _super(svc).create.call(this, ctx, method);
            },
            test: function () {
                this.ctx.response.data("Test Webservice");
                this.ctx.response.send();
            }
        });
        let test = new svc({}, "testMethod");
        assert.ok(constructed, "Did not go through the create fn");
        assert.ok(test.test, "Doesn't have the newly added method");
        assert.ok(test._method === "testMethod", "method not set properly");
    });
    it("extending ts", () => {
        let test = new NewWebservice({}, "test");
        assert.ok(test.isReady === false, "isReady must be set to false by the new webservice");
        assert.ok(test.extraProp === true, "Newly added prop isn't set correctly");
        assert.ok(test.method === "test", "Method isn't set correctly");
    });
});
describe("server", () => {
    let serv;
    before(() => {
        serv = new http_1.RoadieServer({ root: __dirname + "/../", webserviceDir: "webservices" });
    });
    it("Webservice decorators", () => {
        class WebSvc extends webservice_1.WebService {
            halloworld() {
                this.ctx.response.data("Hallo World");
                this.ctx.response.send();
            }
        }
        __decorate([
            http_1.WebMethod("[GET]/ha/lo", { server: serv })
        ], WebSvc.prototype, "halloworld", null);
        const routemap = serv._routemap;
        assert.ok(true
            && routemap.routes["ha"]
            && routemap.routes["ha"].routes["lo"]
            && routemap.routes["ha"].routes["lo"].endpoints.get(http_1.HttpVerb.GET), "Route not found");
        const endp = routemap.routes["ha"].routes["lo"].endpoints.get(http_1.HttpVerb.GET);
        assert.ok(true
            && endp instanceof endpoints_1.WebMethodEndpoint
            && endp.method === "halloworld"
            && endp.script === WebSvc.prototype.constructor, "Invalid endpoint");
    });
});
//# sourceMappingURL=webservice.js.map