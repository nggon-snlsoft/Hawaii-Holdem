"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
exports.TableController = void 0;
const colyseus_1 = require("colyseus");
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const arena_config_1 = require("../arena.config");
const ClientUserData_1 = require("./ClientUserData");
const request_ip_1 = __importDefault(require("request-ip"));
let Address6 = require('ip-address').Address6;
class TableController {
    constructor() {
        this.router = null;
        this.conf = null;
        this.router = express_1.default.Router();
        this.initRouter();
        this.Init();
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            let confFile = yield fs.readFileSync(path.join(__dirname, "../config/ServerConfigure.json"), { encoding: 'utf8' });
            let confJson = JSON.parse(confFile.toString());
            this.conf = confJson['server'];
        });
    }
    RefreshConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let confFile = yield fs.readFileSync(path.join(__dirname, "../config/ServerConfigure.json"), { encoding: 'utf8' });
            let confJson = JSON.parse(confFile.toString());
            this.conf = confJson['server'];
        });
    }
    initRouter() {
        this.router.post('/get', this.getTABLE_LIST.bind(this));
        this.router.post('/enter', this.enterTABLE.bind(this));
    }
    getIp(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let ip = yield request_ip_1.default.getClientIp(req);
            let address = new Address6(ip);
            next(address.parsedAddress4);
        });
    }
    getTABLE_LIST(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let client_version = req.body.version;
            let server_version = this.conf.version;
            if (client_version == null || client_version != server_version) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'VERSION_MISMATCH'
                });
                return;
            }
            let tables = [];
            try {
                tables = yield this.getTABLE_LIST_FromDB(req.app.get('DAO'));
                if (tables == null || tables == undefined || tables.length <= 0) {
                    res.status(200).json({
                        code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'NO_TABLES',
                    });
                    return;
                }
            }
            catch (error) {
                console.log(error);
                return;
            }
            let _tables = [];
            let rooms = [];
            try {
                rooms = yield colyseus_1.matchMaker.query({ private: false });
                for (let i = 0; i < tables.length; i++) {
                    let t = ClientUserData_1.ClientUserData.getClientTableData(tables[i]);
                    let r = rooms.find((e) => {
                        return e.serial == t.id;
                    });
                    if (r != null) {
                    }
                    let p = (r == null) ? 0 : r.clients;
                    t.players = p;
                    _tables.push(t);
                }
            }
            catch (error) {
                console.log(error);
            }
            res.status(200).json({
                code: arena_config_1.ENUM_RESULT_CODE.SUCCESS,
                tables: _tables,
                msg: 'SUCCESS',
            });
        });
    }
    enterTABLE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let table_id = req.body.table_id;
            let user_id = req.body.user_id;
            let token = req.body.token;
            let client_version = req.body.version;
            let server_version = this.conf.version;
            if (client_version == null || client_version != server_version) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'VERSION_MISMATCH'
                });
                return;
            }
            let verify = null;
            try {
                verify = yield this.reqTOKEN_VERIFY(req.app.get('DAO'), user_id, token);
            }
            catch (error) {
                console.log(error);
            }
            if (verify == null || verify == false) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            if (table_id == null || user_id == null || user_id < 0) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'TABLEID_OR_USER_ID_NULL',
                });
                return;
            }
            let user = null;
            try {
                user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (user == undefined) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INCORRECT_ID',
                });
                return;
            }
            if (user.table_id != -1) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_LOGIN',
                });
                return;
            }
            let table = null;
            try {
                table = yield this.getTABLE_ByTABLE_ID(req.app.get('DAO'), table_id);
            }
            catch (error) {
                console.log(error);
            }
            if (table == undefined) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INCORRECT_TABLE_INFO',
                });
                return;
            }
            let balance = user.balance;
            let minBuyIn = table.minStakePrice;
            if (balance < minBuyIn) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NOT_ENOUGHT_BALANCE',
                    balance: balance,
                    buyin: minBuyIn
                });
                return;
            }
            let _tables = ClientUserData_1.ClientUserData.getClientTableData(table);
            let gameSize = (_tables.maxPlayers == 9) ? 'holdem_full' : 'holdem_short';
            let room = yield colyseus_1.matchMaker.query({
                private: false,
                name: gameSize,
                serial: _tables.id
            });
            if (room != null && room.length > 0) {
                if (room[0].maxClients == room[0].clients) {
                    res.status(200).json({
                        code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'TABLE_IS_FULL',
                    });
                    return;
                }
            }
            let clientIp = '';
            try {
                yield this.getIp(req, (ip) => {
                    clientIp = ip;
                });
            }
            catch (error) {
                clientIp = '';
            }
            yield this.RefreshConfig();
            if (this.conf.checkIpDuplication) {
                let users = [];
                try {
                    users = yield this.getUSERS_ByTABLE_ID(req.app.get('DAO'), table_id);
                }
                catch (error) {
                    console.log(error);
                }
                if (users != null && users.length > 0) {
                    let d = users.find((e) => {
                        return (e.login_ip.length > 0) && (clientIp == e.login_ip);
                    });
                    if (d != null) {
                        res.status(200).json({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'TABLE_DUPLICATE_IP',
                        });
                        return;
                    }
                }
            }
            let seatReservation = null;
            try {
                seatReservation = yield colyseus_1.matchMaker.joinOrCreate(gameSize, { private: false, serial: _tables.id });
            }
            catch (error) {
                console.log(error);
            }
            if (seatReservation == null || seatReservation == undefined) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'TABLE_JOIN_FAIL',
                });
                return;
            }
            user.pendingSessionId = seatReservation.sessionId;
            user.pendingSessionTimestamp = 0;
            Date.now();
            user.table_id = _tables.id;
            user.login_ip = clientIp;
            let session_id = seatReservation.sessionId;
            if (session_id == null || session_id.length <= 0) {
                res.status(200).json({
                    code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'TABLE_JOIN_FAIL',
                });
            }
            try {
                yield this.reqSESSION_ID(req.app.get('DAO'), {
                    session_id: session_id,
                    id: user.id,
                });
            }
            catch (error) {
                console.log(error);
            }
            let tb = null;
            try {
                tb = yield this.reqTABLE_ID(req.app.get('DAO'), user);
            }
            catch (error) {
                console.log(error);
            }
            res.status(200).json({
                code: arena_config_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                ip: clientIp,
                seatReservation: seatReservation,
                info: _tables,
                count: _tables.maxPlayers,
            });
        });
    }
    reqSESSION_ID(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_USERS_SESSION_ID(data, (err, res) => {
                    if (!!err) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    resolve(res);
                });
            });
        });
    }
    reqPENDING_STATE(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_USERS_PENDING(data, (err, res) => {
                    if (!!err) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    resolve(res);
                });
            });
        });
    }
    reqTABLE_ID(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_USERS_TABLE_ID_LOGIN_IP_ByUSER(data, function (err, res) {
                    if (!!err) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    resolve(res);
                });
            });
        });
    }
    getTABLE_LIST_FromDB(dao) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_TABLES((err, res) => {
                    if (err != null) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    getTABLE_ByTABLE_ID(dao, table_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_TABLES_ByTABLE_ID(table_id, (err, res) => {
                    if (err != null) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    getUSERS_ByTABLE_ID(dao, table_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USERS_ByTABLE_ID(table_id, (err, res) => {
                    if (err != null) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    getUSER_ByUSER_ID(dao, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USERS_ByUSER_ID(id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    resolve(res[0]);
                });
            });
        });
    }
    reqTOKEN_VERIFY(dao, user_id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USERS_BY_USER_ID_TOKEN(user_id, token, function (err, res) {
                    if (!!err) {
                        reject({
                            code: arena_config_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
}
exports.TableController = TableController;
exports.default = TableController;
