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
exports.InstanceRoomManager = void 0;
const colyseus_1 = require("colyseus");
const logger_1 = __importDefault(require("../util/logger"));
class InstanceRoomManager {
    constructor(updateTerm) {
        this.instanceRoomId = -1;
        this.rooms = [];
        this.makeRequestQueue = [];
        this.lastQueryTime = -1;
        this.updateTerm = 0;
        this.updateTerm = updateTerm;
    }
    static Instance() {
        if (null == this.instance) {
            this.instance = new InstanceRoomManager(60000);
        }
        return this.instance;
    }
    RequestMakeInstanceRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let roomId = 7000 + this.rooms.length + 1;
            let roomInfo = {
                roomId: roomId,
                info: req.body,
            };
            this.rooms.push(roomInfo);
            console.log(this.rooms);
            res.status(200).json({
                roomId: roomId,
                info: roomInfo,
            });
        });
    }
    RequestJoinInstanceRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null == req.body.roomId || null == req.body.pinCode) {
                res.status(400);
                res.send({ msg: "Bad Request" });
                return;
            }
            let roomId = req.body.roomId;
            let pinCode = req.body.pinCode;
            let userData = yield this.getAccount(req.app.get("DAO"), pinCode);
            if (userData == undefined) {
                res.send({ msg: "Incorrect Pin Code." });
                return;
            }
            let roomData = this.rooms.find((e) => {
                return roomId == e.roomId;
            });
            if (roomData == null) {
                res.send({ msg: 'Incorrect Room Id' });
                return;
            }
            let seatReservation = null;
            let type = 'holdem_full';
            let room = yield colyseus_1.matchMaker.query({ private: false, name: type, serial: roomId });
            seatReservation = yield colyseus_1.matchMaker.joinOrCreate(type, { private: false, serial: roomId });
            userData.pendingSessionId = seatReservation.sessionId;
            userData.pendingSessionTimestamp = Date.now();
            userData.publicRoomID = roomId;
            yield this.updateAccountPendingState(req.app.get("DAO"), userData);
            yield this.updatePublicRoomID(req.app.get("DAO"), userData);
            const userCopy = Object.assign({}, userData);
            delete userCopy.pin_code;
            res.status(200).json({
                seatReservation: seatReservation,
                user: userCopy,
                seatCount: roomData["maxPlayers"]
            });
        });
    }
    updateAccountPendingState(dao, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                dao.updateAccountPending(updateData, function (err, result) {
                    if (!!err) {
                        logger_1.default.error("[ publicRoomManager::updateAccountPendingState ] query error : %s", err);
                        rej(new colyseus_1.ServerError(400, "bad access token"));
                    }
                    else {
                        // logger.info( "[ authController::updateAccount ] query res : %s", JSON.stringify( result ) );
                        res(result);
                    }
                });
            });
        });
    }
    updatePublicRoomID(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                dao.updatePublicRoomID(data, function (err, result) {
                    if (!!err) {
                        logger_1.default.error("[ publicRoomManager::updatePublicRoomID ] query error : %s", err);
                        rej(new colyseus_1.ServerError(400, "bad access token"));
                    }
                    else {
                        // logger.info( "[ authController::updateAccount ] query res : %s", JSON.stringify( result ) );
                        res(result);
                    }
                });
            });
        });
    }
    getAccount(dao, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.selectAccountByUID(uid, function (err, res) {
                    if (!!err) {
                        logger_1.default.error("[ authController::getAccount ] query error : %s", err);
                        reject(new colyseus_1.ServerError(400, "bad access token"));
                    }
                    else {
                        // logger.info( "[ authController::getAccount ] query res : %s", JSON.stringify( res[ 0 ] ) );
                        resolve(res[0]);
                    }
                });
            });
        });
    }
}
exports.InstanceRoomManager = InstanceRoomManager;
InstanceRoomManager.instance = null;
