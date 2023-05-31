"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENUM_RESULT_CODE = void 0;
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors = require("cors");
const methodOverride = require("method-override");
const session = require("express-session");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const favicon = require("serve-favicon");
const sql = require("./modules/sqlProxy");
const dao = require("./modules/dao");
const HoldemRoom_1 = require("./rooms/HoldemRoom");
const TableController_1 = __importDefault(require("./controllers/TableController"));
const port = Number(process.env.PORT || 2568);
var ENUM_RESULT_CODE;
(function (ENUM_RESULT_CODE) {
    ENUM_RESULT_CODE[ENUM_RESULT_CODE["UNKNOWN_FAIL"] = -1] = "UNKNOWN_FAIL";
    ENUM_RESULT_CODE[ENUM_RESULT_CODE["SUCCESS"] = 0] = "SUCCESS";
    ENUM_RESULT_CODE[ENUM_RESULT_CODE["EXPIRED_SESSION"] = 1] = "EXPIRED_SESSION";
})(ENUM_RESULT_CODE = exports.ENUM_RESULT_CODE || (exports.ENUM_RESULT_CODE = {}));
let tableController = null;
exports.default = arena_1.default({
    getId: () => "Texas Holdem App",
    initializeGameServer: (gameServer) => {
        const sqlClient = sql.init();
        dao.init(sqlClient);
        gameServer.define("holdem_full", HoldemRoom_1.HoldemRoom, { dao: dao, ts: "full", clientLimit: 9, passPrice: 2000 }).filterBy(["serial"]);
        gameServer.define("holdem_short", HoldemRoom_1.HoldemRoom, { dao: dao, ts: "short", clientLimit: 6, passPrice: 1000 }).filterBy(["serial"]);
        gameServer.onShutdown(function () {
            console.log("game server is going down.");
        });
    },
    initializeExpress: (app) => {
        app.use(cors());
        app.use(favicon(__dirname + "/static/favicon.ico"));
        app.use(methodOverride());
        app.use(session({
            resave: true,
            saveUninitialized: true,
            secret: "uwotm8"
        }));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        if (app.get("env") === "development") {
            app.use(errorHandler());
        }
        else {
        }
        tableController = new TableController_1.default();
        app.set("DAO", dao);
        app.use("/tables", tableController.router);
        app.use("/check", (req, res) => {
            res.send("GAME_SERVER_OK");
        });
        app.get("/", (req, res) => {
            res.send("It could not be a better day to die~~ :)");
        });
        app.use("/", express_1.default.static(path_1.default.join(__dirname, "static")));
        app.use("/colyseus", monitor_1.monitor());
        process.on("uncaughtException", function (err) {
            console.error("Caught exception: " + err.stack);
        });
        process.on("exit", function (code) {
            console.log("About to exit with code : ", code);
        });
    },
    beforeListen: () => {
    }
});
