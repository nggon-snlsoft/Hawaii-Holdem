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
exports.StoreController = void 0;
const express_1 = __importDefault(require("express"));
const main_1 = require("../main");
const ClientUserData_1 = require("./ClientUserData");
const requestIp = require('request-ip');
const gameConf = require('../config/gameConf.json');
class StoreController {
    constructor(sql) {
        this.router = null;
        this.sql = null;
        this.router = express_1.default.Router();
        this.sql = sql;
        this.InitRouter();
        console.log('STORE_CONTROLLER_INITIALIZED');
    }
    InitRouter() {
        this.router.post('/get', this.onGET_STORE.bind(this));
        this.router.post('/charge/req', this.onREQ_CHARGE.bind(this));
        this.router.post('/transfer/req', this.onREQ_TRANSFER.bind(this));
        this.router.post('/chargeRequest/get', this.onGET_CHARGE_REQUESTS.bind(this));
        this.router.post('/transferRequest/get', this.onGET_TRANSFER_REQUESTS.bind(this));
        this.router.post('/popups/get', this.onGET_POPUPS.bind(this));
        this.router.post('/ticket/check', this.onCHECK_TICKETS.bind(this));
    }
    onGET_STORE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let store_id = req.body.store_id;
            let user_id = req.body.user_id;
            let token = req.body.token;
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
            if (store_id == null || store_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_STORE_ID'
                });
                return;
            }
            let store = null;
            try {
                store = yield this.getSTORE_BySTORE_ID(req.app.get('DAO'), store_id);
            }
            catch (error) {
                console.log(error);
            }
            if (store === null || store === undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let _store = ClientUserData_1.ClientUserData.getClientStoreData(store);
            res.status(200).json({
                code: main_1.ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                store: _store,
            });
        });
    }
    onREQ_CHARGE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
            let amount = req.body.amount;
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
            if (user_id == null || user_id <= 0 || amount < 10000) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_STORE_ID'
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
            if (user == null || user == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_EXIST_ID'
                });
                return;
            }
            let affected = null;
            try {
                affected = yield this.reqCHARGE_REQUEST(req.app.get('DAO'), {
                    user: user,
                    amount: amount
                });
            }
            catch (error) {
                console.log(error);
            }
            if (affected == true) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS',
                });
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INSERT_FAIL',
                });
            }
        });
    }
    onREQ_TRANSFER(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let value = req.body.value;
            let password = req.body.password;
            let token = req.body.token;
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
            if (user_id == null || user_id <= 0 || value < 10000) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_PARAMETER'
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
            if (user == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_USER_ID',
                });
                return;
            }
            if (user.transferpassword != password) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TRANSFER_PASSWORD',
                });
                return;
            }
            let result = null;
            try {
                result = yield this.reqTRANSFER_REQUEST(req.app.get('DAO'), {
                    user: user,
                    value: value
                });
            }
            catch (error) {
                console.log(error);
            }
            if (result == null || result == undefined) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'TRANSFER_REQUEST_FAIL',
                });
                return;
            }
            if (result.affected == 1) {
                let r = null;
                try {
                    r = yield this.setUSER_BALANCE(req.app.get('DAO'), {
                        id: user.id,
                        newBalance: result.balance
                    });
                }
                catch (error) {
                    console.log(error);
                }
                if (r != null && r.length > 0) {
                    let _user = ClientUserData_1.ClientUserData.getClientUserData(r[0]);
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.SUCCESS,
                        msg: 'SUCCESS',
                        user: _user,
                    });
                }
                else {
                    res.status(200).json({
                        code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'UPDATE_BALANCE_FAIL',
                    });
                }
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INSERT_FAIL',
                });
            }
        });
    }
    onGET_CHARGE_REQUESTS(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
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
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_USER_ID'
                });
                return;
            }
            let charges = null;
            try {
                charges = yield this.reqCHARGE_REQUSETS_ByUSER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (charges == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                });
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS',
                    charges: charges,
                });
            }
        });
    }
    onGET_TRANSFER_REQUESTS(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let token = req.body.token;
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
            if (user_id == null || user_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_USER_ID'
                });
                return;
            }
            let transfers = null;
            try {
                transfers = yield this.reqTRANSFER_REQUESTS_ByUSER_ID(req.app.get('DAO'), user_id);
            }
            catch (error) {
                console.log(error);
            }
            if (transfers == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                });
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS',
                    transfers: transfers,
                });
            }
        });
    }
    onGET_POPUPS(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user_id = req.body.user_id;
            let store_id = req.body.store_id;
            let token = req.body.token;
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
            if (store_id == null || store_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_STORE_ID'
                });
                return;
            }
            let popups = null;
            try {
                popups = yield this.reqPOPUPS_BySTORE_ID(req.app.get('DAO'), store_id);
            }
            catch (error) {
                console.log(error);
            }
            // let tickets: any = null;
            // try {
            //     tickets = await this.reqTICKETS_ByUSER_ID( req.app.get('DAO'), user_id );
            // } catch (error) {
            //     console.log( error );            
            // }
            if (popups == null) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'POPUP_NULL',
                });
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS',
                    popups: popups,
                });
            }
        });
    }
    onCHECK_TICKETS(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let ticket_id = req.body.ticket_id;
            if (ticket_id == null || ticket_id <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_TICKET_ID'
                });
                return;
            }
            let affected = null;
            try {
                affected = yield this.reqCHECK_TICKET_ByTICKET_ID(req.app.get('DAO'), ticket_id);
            }
            catch (error) {
                console.log(error);
            }
            if (affected == null || affected <= 0) {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                });
            }
            else {
                res.status(200).json({
                    code: main_1.ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS',
                });
            }
        });
    }
    getUSER_ByUSER_ID(dao, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_USER_BY_USER_ID(id, function (err, res) {
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
    getSTORE_BySTORE_ID(dao, store_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_STORE_BySTORE_ID(store_id, function (err, res) {
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
    reqCHARGE_REQUEST(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_CHARGE_REQUEST(data, function (err, res) {
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
    reqTRANSFER_REQUEST(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_TRANSFER_REQUEST(data, function (err, res) {
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
    setUSER_BALANCE(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = data.id;
            let value = data.newBalance;
            return new Promise((resolve, reject) => {
                dao.UPDATE_USER_BALANCE({
                    id: id,
                    newBalance: value,
                }, function (err, res) {
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
    reqCHARGE_REQUSETS_ByUSER_ID(dao, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_CHARGE_REQUESTS_ByUSER_ID(id, function (err, res) {
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
    reqTRANSFER_REQUESTS_ByUSER_ID(dao, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_TRANSFER_REQUEST_ByUSER_ID(id, function (err, res) {
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
    reqPOPUPS_BySTORE_ID(dao, store_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_POPUPS_BySTORE_ID(store_id, function (err, res) {
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
    reqCHECK_TICKET_ByTICKET_ID(dao, ticket_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_TICKETS_ALIVE(ticket_id, function (err, res) {
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
    reqTICKETS_ByUSER_ID(dao, user_id) {
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
}
exports.StoreController = StoreController;
exports.default = StoreController;
