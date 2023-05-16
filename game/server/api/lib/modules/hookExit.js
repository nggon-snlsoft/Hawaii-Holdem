"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const callbacks = new Set();
let isCalled = false;
let isRegistered = false;
function exit(shouldManuallyExit, signal) {
    if (isCalled) {
        return;
    }
    isCalled = true;
    for (const callback of callbacks) {
        callback();
    }
    if (shouldManuallyExit === true) {
        process_1.default.exit(128 + signal); // eslint-disable-line unicorn/no-process-exit
    }
}
function exitHook(onExit) {
    callbacks.add(onExit);
    if (!isRegistered) {
        isRegistered = true;
        process_1.default.once('exit', exit);
        process_1.default.once('SIGINT', exit.bind(undefined, true, 2));
        process_1.default.once('SIGTERM', exit.bind(undefined, true, 15));
        // PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
        // explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
        // event cannot support async handlers, since the event loop is never called after it.
        process_1.default.on('message', message => {
            if (message === 'shutdown') {
                exit(true, -128);
            }
        });
    }
    return () => {
        callbacks.delete(onExit);
    };
}
exports.default = exitHook;
