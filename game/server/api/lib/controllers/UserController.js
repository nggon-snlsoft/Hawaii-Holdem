"use strict";
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
exports.UserController = void 0;
const express_1 = __importDefault(require("express"));
const main_1 = require("../main");
const ClientUserData_1 = require("./ClientUserData");
const jsonwebtoken_1 = require("jsonwebtoken");
const JwtMiddleware_1 = require("../routes/JwtMiddleware");
const requestIp = require('request-ip');
// const LocalStrategy = passportLocal.Strategy;
const gameConf = require('../config/gameConf.json');
class UserController {
    constructor(sql) {
        this.router = null;
        this.sql = null;
        this.router = express_1.default.Router();
        this.sql = sql;
        this.initRouter();
        // this.initPassport();
        console.log('USER_CONTROLLER_INITIALIZED');
    }
    initRouter() {
        this.router.post('/login', this.reqLOGIN.bind(this));
        this.router.post('/join', this.reqJOIN.bind(this));
        this.router.post('/refresh', this.reqREFRESH.bind(this));
        this.router.post('/get', this.getUSER.bind(this));
        this.router.post('/check/login_id', this.checkLOGIN_ID.bind(this));
        this.router.post('/check/nickname', this.checkUSER_NICKNAME.bind(this));
        this.router.post('/point/transfer', this.transferPOINT.bind(this));
        this.router.post('/point/transferLog', this.getPOINT_TRANSFER_LOG.bind(this));
        this.router.post('/point/receiveLog', this.getPOINT_RECEIVE_LOG.bind(this));
        this.router.post('/qna/get', this.reqGET_QNA.bind(this));
        this.router.post('/qna/send', this.reqSEND_QNA.bind(this));
        this.router.post('/getInitData', this.getINIT_DATA.bind(this));
        this.router.post('/updateAvatar', this.updateAVATAR.bind(this));
        this.router.post('/setting/get', this.getSETTING.bind(this));
        this.router.post('/setting/update', this.updateSETTING.bind(this));
        this.router.post('/statics/get', this.getSTATICS.bind(this));
        this.router.post('/token/verify', this.checkTOKEN.bind(this));
    }
    getIp(req, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let ip = yield requestIp.getClientIp(req);
            next(ip);
        });
    }
    reqLOGIN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let login_id = req.body.login_id;
            let password = req.body.password;
            if (req.body.version == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_VERSION'
                });
                return;
            }
            let version = req.body.version;
            if (login_id == null || login_id.length < 4) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
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
            let data = null;
            try {
                data = yield this.getUSER_ByLOGIN_ID(req.app.get('DAO'), login_id);
            }
            catch (error) {
                console.log(error);
                return;
            }
            if (data == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_LOGIN_ID'
                });
                return;
            }
            if (password != data.password) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_MATCH_PASSWORD'
                });
                return;
            }
            if (data.alive == 0 || data.disable == 1) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DISABLE_ACCOUNT'
                });
                return;
            }
            let token = (0, jsonwebtoken_1.sign)({
                login_id: login_id,
                password: password
            }, JwtMiddleware_1.SECRET_KEY, {});
            let affected = null;
            try {
                affected = yield this.reqTOKEN_ByLOGIN_ID(req.app.get('DAO'), token, login_id);
            }
            catch (error) {
                console.log(error);
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                id: data.id,
                ip: clientIp,
                token: token,
            });
        });
    }
    getINIT_DATA(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _user = ClientUserData_1.ClientUserData.getClientUserData(user);
            let setting = null;
            try {
                setting = yield this.getSETTING_BY_USER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            let affected = 0;
            if (setting == null || setting == undefined) {
                try {
                    affected = yield this.createSETTING(req.app.get('DAO'), user_id);
                }
                catch (error) {
                    console.log(error);
                }
                try {
                    setting = yield this.getSETTING_BY_USER_ID(req.app.get('DAO'), user_id);
                }
                catch (error) {
                    console.log(error);
                }
                if (setting == undefined) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'LOAD_SETTING_ERROR'
                    });
                    return;
                }
            }
            let _setting = ClientUserData_1.ClientUserData.getClientSettingData(setting);
            let statics = null;
            try {
                statics = yield this.getSTATICS_ByUSER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (statics == null || statics == undefined) {
                let affected = null;
                try {
                    affected = yield this.createSTATICS(req.app.get('DAO'), user_id);
                }
                catch (error) {
                    console.log(error);
                }
                try {
                    statics = yield this.getSTATICS_ByUSER_ID(req.app.get('DAO'), user_id);
                }
                catch (error) {
                    console.log(error);
                }
                if (setting == undefined) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'LOAD_STATICS_ERROR'
                    });
                    return;
                }
            }
            let _statics = ClientUserData_1.ClientUserData.getClientStaticsData(statics);
            let conf = gameConf['game'];
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                user: _user,
                setting: _setting,
                statics: _statics,
                conf: conf,
            });
        });
    }
    reqJOIN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = req.body.user;
            if (user.login_id == null || user.login_id.length < 1) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
            if (user.login_id.length <= 0 || user.nickname <= 0 || user.password.length <= 0 ||
                user.transfer_password.length <= 0 || user.phone.length <= 0 || user.bank.length <= 0 ||
                user.holder.length <= 0 || user.account.length <= 0 || user.recommender.length <= 0 /*|| user.store_id < 0*/) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_FORM'
                });
                return;
            }
            let login_id = user.login_id;
            let nickname = user.nickname;
            let data = null;
            try {
                data = yield this.getUSER_ByLOGIN_ID(req.app.get('DAO'), login_id);
                if (data != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'ERROR_GET_USER'
                });
                return;
            }
            data = null;
            try {
                data = yield this.getJOIN_USER_ByLOGIN_ID(req.app.get('DAO'), login_id);
                if (data != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_JOIN_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'ERROR_GET_JOIN_USER'
                });
                return;
            }
            data = null;
            try {
                data = yield this.getUSER_ByNICKNAME(req.app.get('DAO'), nickname);
                if (data != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_NICKNAME'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'ERROR_GET_USER'
                });
                return;
            }
            data = null;
            try {
                data = yield this.getJOIN_USER_ByNICKNAME(req.app.get('DAO'), nickname);
                if (data != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_NICKNAME'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'ERROR_GET_JOIN_USER'
                });
                return;
            }
            let store_code = null;
            try {
                store_code = yield this.getSTORE_ID_ByCODE(req.app.get('DAO'), user.recommender);
            }
            catch (error) {
                console.log(error);
            }
            if (store_code == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_STORE_ID'
                });
                return;
            }
            let store_id = 0;
            if (store_code.store_id != null && store_code.store_id > 0) {
                store_id = store_code.store_id;
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_STORE_ID'
                });
                return;
            }
            user.store_id = store_id;
            let result = null;
            try {
                result = yield this.createJOIN_MEMBER(req.app.get('DAO'), user);
                if (result != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.SUCCESS,
                        msg: 'SUCCESS'
                    });
                    return;
                }
                else {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DB_ERROR'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DB_ERROR'
                });
                return;
            }
        });
    }
    checkLOGIN_ID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let login_id = req.body.login_id;
            if (login_id == null || login_id.length < 1) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
            let user = null;
            try {
                user = yield this.getUSER_ByLOGIN_ID(req.app.get('DAO'), login_id);
                if (user != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_USERS'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            let join = null;
            try {
                join = yield this.getJOIN_USER_ByLOGIN_ID(req.app.get('DAO'), login_id);
                if (join != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_JOIN_USERS'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS'
            });
            return;
        });
    }
    checkUSER_NICKNAME(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nickname = req.body.nickname;
            if (nickname == null || nickname.length < 1) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
            let user = null;
            try {
                user = yield this.getUSER_ByNICKNAME(req.app.get('DAO'), nickname);
                if (user != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_USERS'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            let join = null;
            try {
                join = yield this.getJOIN_USER_ByNICKNAME(req.app.get('DAO'), nickname);
                if (join != null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'DUPLICATE_JOIN_USERS'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS'
            });
            return;
        });
    }
    transferPOINT(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let value = req.body.value;
            let desc = req.body.desc;
            let token = req.body.token;
            if (desc == null) {
                desc = "";
            }
            if (user_id == null || value == null || value <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let user = null;
            try {
                user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
                if (user != null) {
                    if (user.point < value) {
                        res.status(200).json({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'NOT_ENOUGH_POINT'
                        });
                    }
                }
                else {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            let point = user.point;
            let balance = user.balance;
            let remainPoint = point - value;
            let newBalance = user.balance + value;
            if (remainPoint < 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
            try {
                let affected = yield this.reqPOINT_TRANSFER(req.app.get('DAO'), {
                    user_id: user_id,
                    point: remainPoint,
                    balance: newBalance,
                });
                if (Number(affected) < 1) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            user = null;
            try {
                user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
                if (user == null) {
                    // res.status( 200 ).json({
                    //     code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    //     msg: 'NOT_ENOUGH_POINT'
                    // });
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            let logs = null;
            try {
                logs = yield this.reqPOINT_TRANSFER_LOG(req.app.get('DAO'), {
                    user_id: user_id,
                    oldPoint: point,
                    newPoint: user.point,
                    point: value,
                    oldBalance: balance,
                    newBalance: user.balance,
                    desc: desc,
                });
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            let _user = ClientUserData_1.ClientUserData.getClientUserData(user);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                user: _user,
                logs: logs
            });
            return;
        });
    }
    getPOINT_TRANSFER_LOG(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id < 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let logs = null;
            try {
                logs = yield this.getTRANSFER_LOGS(req.app.get('DAO'), user_id);
                if (logs == null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                logs: logs
            });
            return;
        });
    }
    getPOINT_RECEIVE_LOG(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id < 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let logs = null;
            try {
                logs = yield this.getRECEIVE_LOGS(req.app.get('DAO'), user_id);
                if (logs == null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                logs: logs
            });
            return;
        });
    }
    reqGET_QNA(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id < 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let qnas = null;
            try {
                qnas = yield this.getQNA(req.app.get('DAO'), user_id);
                if (qnas == null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                qnas: qnas
            });
            return;
        });
    }
    reqSEND_QNA(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            let data = req.body.data;
            if (user_id == null || user_id < 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            console.log(user_id);
            let user = null;
            try {
                user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
                if (user == null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            console.log(user);
            let affected = null;
            try {
                affected = yield this.sendQNA(req.app.get('DAO'), user, data);
                if (affected == null) {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'INVALID_UID'
                    });
                    return;
                }
            }
            catch (error) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: error
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                affected: affected,
            });
            return;
        });
    }
    updateAVATAR(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let avatar = req.body.avatar;
            let token = req.body.token;
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            if (avatar == null || avatar < 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_AVATAR'
                });
                return;
            }
            let affected = null;
            try {
                affected = yield this.changeUSER_AVATAR(req.app.get('DAO'), user_id, avatar);
            }
            catch (error) {
                console.log(error);
            }
            let user = null;
            try {
                user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (user == null || user == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _user = ClientUserData_1.ClientUserData.getClientUserData(user);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                user: _user,
                affected: affected,
            });
        });
    }
    getUSER(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
            if (user == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _user = ClientUserData_1.ClientUserData.getClientUserData(user);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                user: _user,
            });
        });
    }
    reqREFRESH(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let user = yield this.getUSER_ByUSER_ID(req.app.get('DAO'), user_id);
            if (user == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _user = ClientUserData_1.ClientUserData.getClientUserData(user);
            let tickets = yield this.getTICKETS_ByUSER_ID(req.app.get('DAO'), user_id);
            if (tickets == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                user: _user,
                tickets: tickets
            });
        });
    }
    getSETTING(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id <= 0 || token == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let setting = null;
            try {
                setting = yield this.getSETTING_BY_USER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.error();
            }
            if (setting == null || setting == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _setting = ClientUserData_1.ClientUserData.getClientSettingData(setting);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                setting: _setting,
            });
        });
    }
    updateSETTING(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let selected = req.body.setting;
            let token = req.body.token;
            if (user_id == null || user_id <= 0 || token == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let affected = null;
            try {
                affected = yield this.setSETTING_ByUSER_ID(req.app.get('DAO'), user_id, selected);
            }
            catch (error) {
                console.log(error);
            }
            let setting = null;
            try {
                setting = yield this.getSETTING_BY_USER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (setting == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _setting = ClientUserData_1.ClientUserData.getClientSettingData(setting);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                affected: affected,
                setting: _setting,
            });
        });
    }
    getSTATICS(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            let statics = null;
            try {
                statics = yield this.getSTATICS_ByUSER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (statics == null || statics == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _stactics = ClientUserData_1.ClientUserData.getClientStaticsData(statics);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                statics: _stactics,
            });
        });
    }
    checkTOKEN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_ID'
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
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TOKEN'
                });
                return;
            }
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'TOKEN_VERIFY_SUCCESS',
            });
        });
    }
    sendError(res, msg) {
        res.status(400).json({
            msg: msg,
        });
    }
    getUSER_ByUSER_ID(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USER_BY_USER_ID(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    getTICKETS_ByUSER_ID(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_TICKETS_ByUSER_ID(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getTRANSFER_LOGS(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_POINT_TRANSFER_LOG(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getRECEIVE_LOGS(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_POINT_RECEIVE_LOG(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getQNA(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_QUESTIONS_ByUSER_ID(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    sendQNA(dao, user, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_QNA(user, data, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getUSER_ByLOGIN_ID(dao, login_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USERS_BY_LOGIN_ID(login_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    reqTOKEN_ByLOGIN_ID(dao, token, login_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_USERS_TOKEN_LOGIN_ID(token, login_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getJOIN_USER_ByLOGIN_ID(dao, login_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_JOINS_BY_LOGIN_ID(login_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    getJOIN_USER_ByNICKNAME(dao, nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_JOINS_BY_NICKNAME(nickname, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    getUSER_ByNICKNAME(dao, nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USERS_BY_NICKNAME(nickname, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
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
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getSETTING_BY_USER_ID(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_SETTING_BY_USER_ID(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    setSETTING_ByUSER_ID(dao, user_id, setting) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_SETTING(user_id, setting, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getSTATICS_ByUSER_ID(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_STATICS_BY_USER_ID(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    createJOIN_MEMBER(dao, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.insertJOIN_MEMBER(user, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    getSTORE_ID_ByCODE(dao, code) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_STORE_CODE_ByCODE(code, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    createSETTING(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_SETTING(user_id, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    createSTATICS(dao, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_STATICS(user_id, (err, res) => {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    changeUSER_AVATAR(dao, id, avatar) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_AVATAR(id, avatar, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    reqPOINT_TRANSFER(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_POINT_TRANSFER(data, function (err, res) {
                    if (!!err) {
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
    reqPOINT_TRANSFER_LOG(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_POINT_TRANSFER_LOG(data, function (err, res) {
                    if (!!err) {
                        console.log(err);
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
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
exports.UserController = UserController;
exports.default = UserController;
