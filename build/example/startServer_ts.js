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
const j = require("../");
let routes = [
    "routing.json",
    {
        "[GET]/query/": (ctx) => {
            ctx.response.data("static");
            ctx.response.send();
        },
    },
];
let server;
function all() {
    return __awaiter(this, void 0, void 0, function* () {
        server = new j.Server({ port: 8080, webserviceDir: "webservices/", root: __dirname });
        j.setDefaultServer(server);
        server.addRoutes(routes[0]);
        server.addRoutes(routes[1]);
        require("./webservices/ws.js");
        yield server.start();
        console.log("Go to http://localhost:8080/test/{anything}/ or http://localhost:8080/statics/test.html");
    });
}
let first = true;
process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
    if (first) {
        first = false;
        console.log("Gracefully stopping, pres ctrl+c again to force stop");
        yield server.stop();
    }
    else {
        process.exit();
    }
}));
all();
//# sourceMappingURL=startServer_ts.js.map