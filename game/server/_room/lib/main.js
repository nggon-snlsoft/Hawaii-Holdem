"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoldemRoomServer = void 0;
const redis_presence_1 = require("@colyseus/redis-presence");
const redis_driver_1 = require("@colyseus/redis-driver");
const colyseus_1 = require("colyseus");
const express_1 = __importDefault(require("express"));
const HoldemRoom_1 = require("./rooms/HoldemRoom");
const monitor_1 = require("@colyseus/monitor");
let tableController = null;
const cors = require('cors');
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const SQL = require("./modules/sqlProxy");
const DAO = require("./modules/dao");
const HoldemServer = new colyseus_1.Server({
    presence: new redis_presence_1.RedisPresence(),
    driver: new redis_driver_1.RedisDriver(),
    gracefullyShutdown: true,
});
class HoldemRoomServer {
    constructor() {
        this.port = -1;
        // this.InitExpress();
        this.InitMiddleWares();
        this.InitServer();
    }
    InitExpress() {
        this.app = express_1.default();
        this.app.use(cors());
        this.app.use(methodOverride());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded());
        if (this.app.get('env') == 'development ') {
            this.app.use(errorHandler());
        }
        this.app.set('DAO', DAO);
        this.app.use('/colyseus', monitor_1.monitor());
        this.app.use("/check", (req, res) => {
            res.send("GAME_SERVER_OK");
        });
        process.on("uncaughtException", function (err) {
            console.error("Caught exception: " + err.stack);
        });
        process.on("exit", function (code) {
            console.log("About to exit with code : ", code);
        });
    }
    InitMiddleWares() {
        const SQL_CLIENT = SQL.init();
        DAO.init(SQL_CLIENT);
    }
    InitServer() {
        HoldemServer.define("holdem_full", HoldemRoom_1.HoldemRoom, { dao: DAO, ts: "full", clientLimit: 9 }).filterBy(["serial"]);
        HoldemServer.define("holdem_short", HoldemRoom_1.HoldemRoom, { dao: DAO, ts: "short", clientLimit: 6 }).filterBy(["serial"]);
        HoldemServer.onShutdown(function () {
            console.log("HOLDEM SERVER IS GOING DOWN");
        });
        // tableController = new TableController();
        // if ( tableController != null ) {
        //     this.app.use( '/tables', tableController.router );
        // }
    }
    ListenServer(port) {
        this.port = port;
        // this.app.listen(port);
        HoldemServer.listen(this.port);
    }
}
exports.HoldemRoomServer = HoldemRoomServer;
