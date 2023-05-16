"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoldemApiServer = exports.ENUM_RESULT_CODE = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// import passport from 'passport';
const express_session_1 = __importDefault(require("express-session"));
const sqlProxy_1 = require("./modules/sqlProxy");
const dao_1 = __importDefault(require("./modules/dao"));
const hookExit_1 = __importDefault(require("./modules/hookExit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cors = require('cors');
const UserController_1 = __importDefault(require("./controllers/UserController"));
const TableController_1 = __importDefault(require("./controllers/TableController"));
const StoreController_1 = __importDefault(require("./controllers/StoreController"));
const devDBInfo = {
    "host": "127.0.0.1",
    "port": "3306",
    "database": "holdem",
    "user": "root",
    "pw": "root"
};
const devServerInfo = {
    host: '127.0.0.1',
    port: '2568',
};
var ENUM_RESULT_CODE;
(function (ENUM_RESULT_CODE) {
    ENUM_RESULT_CODE[ENUM_RESULT_CODE["UNKNOWN_FAIL"] = -1] = "UNKNOWN_FAIL";
    ENUM_RESULT_CODE[ENUM_RESULT_CODE["SUCCESS"] = 0] = "SUCCESS";
    ENUM_RESULT_CODE[ENUM_RESULT_CODE["EXPIRED_SESSION"] = 2] = "EXPIRED_SESSION";
})(ENUM_RESULT_CODE = exports.ENUM_RESULT_CODE || (exports.ENUM_RESULT_CODE = {}));
class HoldemApiServer {
    constructor() {
        this.userController = null;
        this.storeController = null;
        this.tableController = null;
        this.conf = null;
        this.sqlClient = null;
        this.app = (0, express_1.default)();
        this.sqlClient = new sqlProxy_1.sqlProxy(devDBInfo);
        dao_1.default.init(this.sqlClient);
        this.initMiddleWares();
        this.userController = new UserController_1.default(this.sqlClient);
        this.storeController = new StoreController_1.default(this.sqlClient);
        this.tableController = new TableController_1.default(this.sqlClient, devServerInfo);
        this.initRoutes();
        this.Init();
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            let confFile = yield fs.readFileSync(path.join(__dirname, "../src/config/ServerConfigure.json"), { encoding: 'utf8' });
            let confJson = JSON.parse(confFile.toString());
            this.conf = confJson['server'];
        });
    }
    initRoutes() {
        this.app.use('/users', this.userController.router);
        this.app.use('/store', this.storeController.router);
        this.app.use('/tables', this.tableController.router);
        this.app.get('/', (req, res) => {
            res.send("It could not be a better day to die");
        });
        this.app.use('/check', this.CheckVersion.bind(this));
    }
    CheckVersion(req, res) {
        let cv = req.body.version;
        let sv = this.conf.version;
        if (cv == sv) {
            res.status(200).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                name: this.conf.name,
            });
        }
        else {
            res.status(200).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_VERSION'
            });
        }
    }
    initMiddleWares() {
        this.app.use(cors());
        this.app.use(express_1.default.json());
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({
            extended: true
        }));
        this.app.use((req, res, next) => {
            console.log(`Request occur! ${req.method}, ${req.url}`);
            next();
        });
        this.app.use((0, express_session_1.default)({
            secret: `@#@$MYSIGN#@$#$`,
            resave: false,
            saveUninitialized: true
        }));
        // this.app.use( passport.initialize());
        // this.app.use( passport.session() );
        this.app.set('DAO', dao_1.default);
    }
    listen(port) {
        this.app.listen(port, () => {
            console.log(`API SERVER IS RUNNING ON ${port}`);
        });
    }
}
exports.HoldemApiServer = HoldemApiServer;
(0, hookExit_1.default)(() => {
    console.log("server is Closing");
    console.error("OnExit");
});
