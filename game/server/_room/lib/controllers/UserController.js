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
exports.UserController = void 0;
const colyseus_1 = require("colyseus");
class UserController {
    static Instance() {
        if (this.instance == null) {
            this.instance = new UserController();
        }
        return this.instance;
    }
    GetUserInfoFromDB(dao, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.selectAccountByUID(uid, function (err, res) {
                    if (!!err) {
                        reject(new colyseus_1.ServerError(400, "bad access token"));
                    }
                    else {
                        resolve(res[0]);
                    }
                });
            });
        });
    }
    UpdateUserPendingState(dao, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                dao.updateAccountPending(updateData, function (err, result) {
                    if (!!err) {
                        rej(new colyseus_1.ServerError(400, "bad access token"));
                    }
                    else {
                        res(result);
                    }
                });
            });
        });
    }
    UpdateUserRoomID(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                dao.updatePublicRoomID(data, function (err, result) {
                    if (!!err) {
                        rej(new colyseus_1.ServerError(400, "bad access token"));
                    }
                    else {
                        res(result);
                    }
                });
            });
        });
    }
}
exports.UserController = UserController;
UserController.instance = null;
