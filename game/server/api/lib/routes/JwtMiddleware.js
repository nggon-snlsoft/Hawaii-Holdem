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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreToken = exports.RestoreTokenInfo = exports.TryParseToken = exports.VerifyToken = exports.TOKEN_LIFTTIME = exports.SECRET_KEY = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const main_1 = require("../main");
exports.SECRET_KEY = 'snlsoft09!@';
exports.TOKEN_LIFTTIME = '3h';
const bypassTokenVerify = false;
function VerifyToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (bypassTokenVerify == true) {
            next();
            return;
        }
        if (req.headers['token'] == null) {
            return res.status(401).json({
                result: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID REQUEST'
            });
        }
        let parseToken = null;
        try {
            parseToken = TryParseToken(req.headers['token']);
        }
        catch (error) {
            console.error(error);
        }
        let error = false;
        if (parseToken == null) {
            let newToken = (0, jsonwebtoken_1.sign)({
                uid: User.id,
                iat: Date.now(),
            }, exports.SECRET_KEY, {});
            res.setHeader('new-token', newToken);
            next();
            return;
        }
        req.body.parsedUID = parseToken["uid"];
        next();
    });
}
exports.VerifyToken = VerifyToken;
function TryParseToken(token) {
    let result = null;
    try {
        result = (0, jsonwebtoken_1.verify)(token, exports.SECRET_KEY);
    }
    catch (error) {
    }
    return result;
}
exports.TryParseToken = TryParseToken;
class RestoreTokenInfo {
    constructor() {
        this.loginToken = '';
    }
}
exports.RestoreTokenInfo = RestoreTokenInfo;
function RestoreToken(userId) {
    let tokenInfo = new RestoreTokenInfo();
    tokenInfo.loginToken = (0, jsonwebtoken_1.sign)({
        uid: userId,
        iat: Date.now()
    }, exports.SECRET_KEY, {
        expiresIn: exports.TOKEN_LIFTTIME,
        issuer: 'hawaiiholdemLogin'
    });
    return tokenInfo;
}
exports.RestoreToken = RestoreToken;
