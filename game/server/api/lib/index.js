"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const hookExit_1 = __importDefault(require("./modules/hookExit"));
const server = new main_1.HoldemApiServer();
server.listen(7500);
(0, hookExit_1.default)(() => {
    console.log("server is Closing");
    // appObject.onClose();
    console.error("OnExit");
});
