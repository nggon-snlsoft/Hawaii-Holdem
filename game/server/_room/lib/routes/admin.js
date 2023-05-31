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
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../util/logger"));
const tokenService = require("../modules/token");
const router = express_1.default.Router();
router.get("/", (req, res, next) => {
    console.log("get / ");
    res.send("hello admin");
});
router.post("/login", (req, res) => {
    const dao = req.app.get("DAO");
    let locRes = res;
    dao.selectManagerByUID(req.body.uid, (err, result) => {
        if (!!err) {
            console.log("/login. err : " + JSON.stringify(err));
            return locRes.status(400).json({
                code: 100,
                message: err.sqlMessage
            });
        }
        console.log("res : " + JSON.stringify(result));
        console.log("body : " + JSON.stringify(req.body));
        let locRet = result[0];
        if (req.body.pw !== locRet["pw"]) {
            return locRes.status(400).json({
                code: 100,
                message: "wrong password."
            });
        }
        return locRes.status(200).json({
            code: 0,
            message: "SUCCEED"
        });
    });
});
router.post("/create", (req, res) => {
    console.log("/create params : ", req.body);
    const dao = req.app.get("DAO");
    let locRes = res;
    dao.createAccount(req.body.id, req.body.name, req.body.manager, req.body.pin, req.body.balance, (err, res) => {
        if (!!err) {
            console.log("/create. err : " + JSON.stringify(err));
            return locRes.status(400).json({
                code: 100,
                message: err.sqlMessage
            });
        }
        return locRes.status(200).json({
            code: 0,
            message: "SUCCEED"
        });
    });
});
router.post("/updateBalance", updateBalance);
function updateBalance(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let locRes = res;
        const dao = req.app.get("DAO");
        const userData = yield getAccount(dao, req.body.id);
        let targetBalance = req.body.balance + userData.balance;
        yield updateUserBalance(dao, req.body.id, req.body.manager, targetBalance)
            .then(function () {
            locRes.status(200).json({
                code: 0,
                before: userData.balance,
                after: targetBalance
            });
            insertPurchaseLog(dao, req.body.id, req.body.manager, req.body.balance, userData.balance, targetBalance, 1);
        })
            .catch(function (err) {
            locRes.status(400).json({
                code: 400,
                message: err
            });
            insertPurchaseLog(dao, req.body.id, req.body.manager, req.body.balance, userData.balance, targetBalance, 0);
        });
    });
}
function insertPurchaseLog(dao, id, manager, recharge, before, after, succeed) {
    dao.purchaseLog(id, manager, recharge, before, after, succeed, function (err, res) {
        if (!!err) {
            return logger_1.default.error("[ insertPurchaseLog ] err : %s", err.sqlMessage);
        }
        logger_1.default.info("[ insertPurchaseLog ] res : %s", JSON.stringify(res));
    });
}
function getAccount(dao, uid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dao.selectAccountByUID(uid, function (err, res) {
                if (!!err) {
                    reject(err.sqlMessage);
                }
                else {
                    resolve(res[0]);
                }
            });
        });
    });
}
function updateUserBalance(dao, id, manager, balance) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            dao.purchaseBalance(id, manager, balance, (err, result) => {
                if (!!err) {
                    return rej(err.sqlMessage);
                }
                if (!result) {
                    return rej("Affect row is invalid.");
                }
                res();
            });
        });
    });
}
router.post("/inviteLink", (req, res) => {
    console.log("/inviteLink : ", req.body);
    let result = tokenService.create(req.body.id, req.body.manager, req.body.serial);
    console.log("result : " + result);
    result = "token=" + result + "&ts=" + req.body.size;
    console.log("result : " + result);
    res.status(200).json({
        code: 0,
        link: result
    });
    //token=de8b21055ab017c370c63820e3d8773e&ts=full
});
exports.default = router;
