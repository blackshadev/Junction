"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("../../");
const http_1 = require("../../http");
class WS extends _1.WebService {
    halloWorld() {
        this.ctx.response.data("HalloWorld");
        this.ctx.response.send();
    }
    prom() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve("Told Ya");
                }, 500);
            });
        });
    }
    judas() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new http_1.HttpError(400, "Backstab", "I Lied!"));
                }, 500);
            });
        });
    }
}
__decorate([
    _1.WebMethod("[GET]/ha/lo")
], WS.prototype, "halloWorld", null);
__decorate([
    _1.WebMethod("[GET]/i/promise")
], WS.prototype, "prom", null);
__decorate([
    _1.WebMethod("[GET]/i/promise/judas")
], WS.prototype, "judas", null);
//# sourceMappingURL=ws.js.map