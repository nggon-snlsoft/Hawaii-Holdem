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
exports.publicRoomManager = void 0;
const colyseus_1 = require("colyseus");
const logger_1 = __importDefault(require("../util/logger"));
const ClientUserData_1 = require("./ClientUserData");
class publicRoomManager {
    constructor(updateTerm) {
        this.roomInfo = [];
        this.lastDBQueryTime = 0;
        this.updateTerm = 0;
        this.updateTerm = updateTerm;
    }
    static Instance() {
        if (null == this.instance) {
            console.log("construct publicRoomManager");
            this.instance = new publicRoomManager(60000);
        }
        return this.instance;
    }
    RequestRoomList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let timeDiff = Date.now() - this.lastDBQueryTime;
            if (timeDiff > this.updateTerm) {
                let error = null;
                yield this.getRoomListFromDB(req.app.get("DAO")).then((res) => {
                    this.roomInfo = res == null ? [] : res;
                    publicRoomManager.Instance().lastDBQueryTime = Date.now();
                }).catch((reason) => {
                    error = reason;
                });
                if (null != error) {
                    res.status(error.code).json({
                        msg: error.message
                    });
                    return;
                }
            }
            if (this.roomInfo == null) {
                res.send({ msg: "fail to load RoomList" });
                return;
            }
            let rooms = yield colyseus_1.matchMaker.query({ private: false });
            //logger.info(rooms);
            //result contain 
            let result = [];
            this.roomInfo.forEach(element => {
                let roomID = element.id;
                let room = rooms.find((roomElement) => { return roomElement.serial == roomID; });
                result.push({
                    id: roomID,
                    name: element.name,
                    sb: element.smallBlind,
                    bb: element.bigBlind,
                    players: room == null ? 0 : room.clients,
                    maxPlayers: element.maxPlayers,
                    rule: element.type,
                    useRake: element.useRake,
                    rake: element.rake,
                    useTimePass: element.useTimePass,
                    useFlopRake: element.useFlopRake
                });
            });
            let pinCode = req.body.pinCode;
            let userData = yield this.getAccount(req.app.get("DAO"), pinCode);
            if (userData == undefined) {
                res.send({ msg: "Incorrect Pin Code." });
                return;
            }
            let clientUserData = ClientUserData_1.ClientUserData.getClientUserData(userData);
            res.status(200);
            res.send({ userData: clientUserData, result: result });
        });
    }
    RequestRoomInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.body == null) {
                res.status(400);
                res.send({ msg: "bad Request" });
                return;
            }
            if (req.body.roomID == null) {
                res.status(400);
                res.send({ msg: "bad Request" });
                return;
            }
            let roomID = req.body.roomID;
            logger_1.default.info("search Room ID : " + roomID);
            let roomInfoFromDB = null;
            yield this.getRoomInfoFromDB(req.app.get("DAO"), roomID).then((result) => {
                if (result == null || result.length < 1) {
                    res.status(400);
                    res.send({ msg: "bad Request" });
                    return;
                }
                roomInfoFromDB = result[0];
            }).catch((err) => { logger_1.default.error(err); });
            if (null == roomInfoFromDB) {
                return;
            }
            let result = {
                minStakePrice: roomInfoFromDB.minStakePrice,
                maxStakePrice: roomInfoFromDB.maxStakePrice,
                betTimeLimit: roomInfoFromDB.betTimeLimit,
                timePassPrice: roomInfoFromDB.timePassPrice,
                timePassTerm: roomInfoFromDB.timePassTerm,
                users: []
            };
            let room = yield colyseus_1.matchMaker.query({ private: false, serial: roomID });
            if (room != null && room.length > 0) {
                let serverRoom = yield colyseus_1.matchMaker.getRoomById(room[0].roomId);
                if (null != serverRoom) {
                    //gamming
                    let serverRoomCast = serverRoom;
                    result.users.push(...serverRoomCast.getEntitiesInfo());
                }
            }
            res.status(200);
            res.send({ result: result });
        });
    }
    getRoomListFromDB(dao) {
        return __awaiter(this, void 0, void 0, function* () {
            let getRoomListFromDB = new Promise((resolve, reject) => {
                dao.selectPublicRoomList((err, res) => {
                    if (err != null) {
                        logger_1.default.error("Get RoomList Error " + err);
                        reject(new colyseus_1.ServerError(400, "Bad Request"));
                        return;
                    }
                    resolve(res);
                });
            });
            return getRoomListFromDB;
        });
    }
    getRoomInfoFromDB(dao, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let getRoomInfo = new Promise((resolve, reject) => {
                dao.selectRoom(id, (err, res) => {
                    if (err != null) {
                        logger_1.default.error("Get Room Error " + err);
                        reject(new colyseus_1.ServerError(400, "Bad Request"));
                        return;
                    }
                    resolve(res);
                });
            });
            return getRoomInfo;
        });
    }
    RequestJoinPublicRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null == req.body.roomID || null == req.body.pinCode) {
                res.status(400);
                res.send({ msg: "Bad Request" });
                return;
            }
            let roomID = req.body.roomID;
            let pinCode = req.body.pinCode;
            let userData = yield this.getAccount(req.app.get("DAO"), pinCode);
            if (userData == undefined) {
                res.send({ msg: "Incorrect Pin Code." });
                return;
            }
            let roomData = yield this.getRoomInfoFromDB(req.app.get("DAO"), roomID);
            if (roomData == undefined) {
                res.send({ msg: "Incorrect Room Info." });
                return;
            }
            roomData = roomData[0];
            let seatReservation = null;
            let gameSize = roomData["maxPlayers"] == 9 ? "holdem_full" : "holdem_short";
            let room = yield colyseus_1.matchMaker.query({ private: false, name: gameSize, serial: roomID });
            if (null != room && room.length > 0) {
                logger_1.default.error("Room Found" + room + "   " + room[0].maxClients + " clinet " + room[0].clients);
                if (room[0].maxClients == room[0].clients) {
                    res.send({ msg: "Room is Full" });
                    return;
                }
            }
            seatReservation = yield colyseus_1.matchMaker.joinOrCreate(gameSize, { private: false, serial: roomID });
            userData.pendingSessionId = seatReservation.sessionId;
            userData.pendingSessionTimestamp = Date.now();
            userData.publicRoomID = roomID;
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
exports.publicRoomManager = publicRoomManager;
publicRoomManager.instance = null;
